import { useEffect, useState } from 'react';
import { config } from 'src/config';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import Storage from '@pluto-encrypted/indexdb';

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
  const store = new SDK.Store({
    name: config.PLUTO_DB_NAME,
    storage: Storage,
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
