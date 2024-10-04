import { useEffect, useState } from 'react';
import { config } from 'src/config';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import Storage from '@pluto-encrypted/indexdb';

export const apollo = new SDK.Apollo();
export const castor = new SDK.Castor(apollo);

export const connect = async (importData?: any) => {
  console.log('starting pluto ...');
  const store = new SDK.Store({
    name: config.PLUTO_DB_NAME,
    storage: Storage,
    password: Buffer.from(config.PLUTO_PASSWD).toString('hex'),
  });
  return new SDK.Pluto(store, apollo);
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
