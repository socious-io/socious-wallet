import axios from './http';
import FormData from 'form-data';
import crypto from 'crypto-browserify';
import { config } from 'src/config';
import React, { useEffect } from 'react';
import { useAppContext } from 'src/store/context';

export type Backup = { [dbName: string]: { [storeName: string]: any[] } };

export const encrypt = (raw: Uint8Array, data: any) => {
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(raw));
  const publicKey = ecdh.getPublicKey();
  const sharedSecret = ecdh.computeSecret(publicKey);
  const aesKey = sharedSecret.slice(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, config.SECRET_KEY.slice(0, 16));
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (raw: Uint8Array, encryptedDataHex: string) => {
  // Convert the hex-encoded string back to a Buffer
  const encryptedData = Buffer.from(encryptedDataHex, 'hex');
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(raw));
  const publicKey = ecdh.getPublicKey();
  const sharedSecret = ecdh.computeSecret(publicKey);
  const aesKey = sharedSecret.slice(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, config.SECRET_KEY.slice(0, 16));

  let decrypted = decipher.update(encryptedData); // Use Buffer directly
  decrypted += decipher.final('utf8');
  return decrypted;
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

export const Backup: React.FC = () => {
  const { state } = useAppContext();
  const { pluto, did, credentials } = state || {};

  useEffect(() => {
    const backup = async () => {
      const dbs = await getIndexedDBDatabases(config.PLUTO_DB_NAME);
      const b = await backupIndexedDBs(dbs);
      const pks = await pluto.getDIDPrivateKeysByDID(did);
      const body = encrypt(pks[0].raw, b);
      const blob = new Blob([body]);
      const form = new FormData();
      form.append('file', blob, `${did.methodId}.bin`);
      const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };

      const res = await axios.post(`${config.BACKUP_AGENT}/sync`, form, { headers });
      return res.data;
    };
    if (did && pluto) {
      backup()
        .then(r => console.log(r))
        .catch(err => console.log(err));
    }
  }, [credentials, pluto, did]);

  return <></>;
};
