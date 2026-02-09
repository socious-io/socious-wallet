import axios from './http';
import pako from 'pako';
import FormData from 'form-data';
import crypto from 'crypto-browserify';
import { config } from 'src/config';
import React, { useEffect } from 'react';
import { useAppContext } from 'src/store/context';
import SDK from '@hyperledger/identus-sdk';
import { logger } from 'src/utilities';

export type Backup = { [dbName: string]: { [storeName: string]: any[] } };

const deriveAesKeyFromPrivate = (raw: Uint8Array): Buffer => {
  return crypto.createHash('sha256').update(Buffer.from(raw)).digest(); // 32 bytes
};

export const encrypt = (raw: Uint8Array, data: any, options: { compress?: boolean } = { compress: true }): string => {
  try {
    const aesKey = deriveAesKeyFromPrivate(raw);
    const iv = crypto.randomBytes(16);

    const json = JSON.stringify(data);
    const plainBuf = Buffer.from(json, 'utf8');
    const toEncrypt = options.compress ? Buffer.from(pako.deflate(plainBuf)) : plainBuf;
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(toEncrypt), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Unable to encrypt data');
  }
};

export const decrypt = (
  raw: Uint8Array,
  encryptedDataInput: string,
  options: { compressed?: boolean } = { compressed: true },
): any => {
  try {
    const idx = encryptedDataInput.indexOf(':');
    if (idx === -1) {
      throw new Error('Encrypted input missing IV separator (expected ivHex:cipherHex)');
    }

    const ivHex = encryptedDataInput.slice(0, idx);
    const encryptedHex = encryptedDataInput.slice(idx + 1);

    if (!/^[0-9a-fA-F]+$/.test(ivHex) || !/^[0-9a-fA-F]+$/.test(encryptedHex)) {
      throw new Error('Invalid hex string for IV or encrypted data');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedBuf = Buffer.from(encryptedHex, 'hex');

    if (iv.length !== 16) {
      throw new Error('Invalid IV length (must be 16 bytes)');
    }

    const aesKey = deriveAesKeyFromPrivate(raw);

    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    const decryptedBuf = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
    const plainBuf = options.compressed ? Buffer.from(pako.inflate(decryptedBuf)) : decryptedBuf;
    const json = plainBuf.toString('utf8');
    return JSON.parse(json);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Unable to decrypt data');
  }
};

export const backupIndexedDBs = (dbNames: string[]): Promise<Backup> => {
  return new Promise((resolve, reject) => {
    const allData: Backup = {};

    const backupDatabase = (dbName: string) => {
      return new Promise<void>((resolveDb, rejectDb) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = (event: any) => {
          const db = event.target.result as IDBDatabase;
          if (db.objectStoreNames.length === 0) {
            allData[dbName] = {};
            return resolveDb();
          }

          const transaction = db.transaction(db.objectStoreNames, 'readonly');
          const data: { [storeName: string]: any[] } = {};
          let count = db.objectStoreNames.length;

          for (const storeName of db.objectStoreNames) {
            const objectStore = transaction.objectStore(storeName);
            const allRecordsRequest = objectStore.getAll();

            allRecordsRequest.onsuccess = (event: any) => {
              data[storeName] = event.target.result;
              count--;
              if (count === 0) {
                allData[dbName] = data;
                resolveDb();
              }
            };

            allRecordsRequest.onerror = (event: any) => rejectDb(event.target.error);
          }

          transaction.onerror = (event: any) => rejectDb(event.target.error);
        };

        request.onerror = (event: any) => rejectDb(event.target.error);
      });
    };

    Promise.all(dbNames.map(backupDatabase))
      .then(() => resolve(allData))
      .catch(error => reject(error));
  });
};

export const restoreIndexedDBs = (jsonData: Backup): Promise<void> => {
  return new Promise((resolve, reject) => {
    const restoreDatabase = (dbName: string) => {
      return new Promise<void>((resolveDb, rejectDb) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = (event: any) => {
          const db = event.target.result as IDBDatabase;
          if (db.objectStoreNames.length === 0) {
            return resolveDb(); // No stores to restore
          }

          const transaction = db.transaction(db.objectStoreNames, 'readwrite');

          transaction.oncomplete = () => resolveDb();
          transaction.onerror = (event: any) => rejectDb(event.target.error);

          for (const storeName in jsonData[dbName]) {
            const objectStore = transaction.objectStore(storeName);
            for (const item of jsonData[dbName][storeName]) {
              objectStore.put(item);
            }
          }
        };

        request.onerror = (event: any) => rejectDb(event.target.error);
      });
    };

    Promise.all(Object.keys(jsonData).map(restoreDatabase))
      .then(() => resolve())
      .catch(error => reject(error));
  });
};

export const getIndexedDBDatabases = async (className: string): Promise<string[]> => {
  if (!('databases' in indexedDB)) {
    throw new Error('The IndexedDB databases method is not supported in this browser.');
  }

  const dbs = await (indexedDB as any).databases();
  return dbs.map((db: { name: string }) => db.name).filter(db => db.includes(className));
};

export const fetchBackup = async (didStr: string, pk: SDK.Domain.PrivateKey) => {
  const res = await axios.get(`https://storage.googleapis.com/socious-wallet-gsc/${didStr}.bin`, {
    responseType: 'arraybuffer',
  });
  const uint8Array = new Uint8Array(res.data);
  let dataString;
  try {
    const decompressedData = pako.inflate(uint8Array);
    dataString = new TextDecoder('utf-8').decode(decompressedData);
  } catch (err) {
    logger(err, { componentStack: 'decompress backup file' });
  }
  const data = decrypt(pk.raw, dataString);
  return data;
};

export const backup = async (pluto: SDK.Domain.Pluto, did: SDK.Domain.DID) => {
  const b = await pluto.backup();
  const pks = await pluto.getDIDPrivateKeysByDID(did);
  const body = encrypt(pks[0].raw, JSON.stringify(b));
  const compressed = pako.deflate(body, { to: 'string' });
  const blob = new Blob([compressed]);
  const form = new FormData();
  form.append('file', blob, `${did.methodId}.bin`);
  const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };

  const res = await axios.post(`${config.BACKUP_AGENT}/sync`, form, { headers });
  return res.data;
};

export const Backup: React.FC = () => {
  const { state } = useAppContext();
  const { pluto, did, credentials } = state || {};

  useEffect(() => {
    if (did && pluto) {
      backup(pluto, did)
        .then(r => console.warn(r))
        .catch(err => console.error(err));
    }
  }, [credentials, pluto, did]);

  return <></>;
};
