import { config } from 'src/config';
import SDK from '@atala/prism-wallet-sdk';
import Storage from '@pluto-encrypted/indexdb';

export const connect = (importData?: any) => {
  const apollo = new SDK.Apollo();
  const store = new SDK.Store({
    name: config.PLUTO_DB_NAME,
    storage: Storage,
    importData,
    password: Buffer.from(config.PLUTO_PASSWD).toString('hex'),
  });

  return new SDK.Pluto(store, apollo);
};
