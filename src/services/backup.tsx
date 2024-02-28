import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto-browserify';
import { config } from 'src/config';
import React, { useEffect } from 'react';
import { useAppState } from 'src/store';

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

export const Backup: React.FC = () => {
  const { pluto, did, credentials } = useAppState();

  useEffect(() => {
    const backup = async () => {
      const b = await (pluto as any).backup();
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
        .then((r) => console.log(r))
        .catch((err) => console.log(err));
    }
  }, [credentials, pluto, did]);

  return <></>;
};
