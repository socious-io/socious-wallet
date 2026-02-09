import { useEffect, useState } from 'react';
import { config } from 'src/config';
import SDK from '@hyperledger/identus-sdk';
import { createStore } from '@trust0/identus-store';
import { StorageType } from '@trust0/ridb';

export const apollo = new SDK.Apollo();
export const castor = new SDK.Castor(apollo);

const preStart = async () => {
  const dbs = await indexedDB.databases();
  dbs.forEach(db => {
    if (db.name.includes('did-link')) {
      indexedDB.deleteDatabase(db.name);
    }
  });
};

export const connect = async () => {
  await preStart();
  const store = createStore({
    dbName: config.PLUTO_DB_NAME,
    storageType: StorageType.IndexDB,
    password: Buffer.from(config.PLUTO_PASSWD).toString('hex'),
  });
  const p = new SDK.Pluto(store, apollo);
  await p.start();
  return p;
};

export function usePluto() {
  const [pluto, setPluto] = useState<SDK.Domain.Pluto>();

  useEffect(() => {
    if (!pluto) {
      connect().then(db => setPluto(db));
    }
  }, [pluto]);

  return { pluto };
}
