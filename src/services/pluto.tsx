import { useEffect, useState } from 'react';
import { config } from 'src/config';
import SDK from '@atala/prism-wallet-sdk';
import { Database } from '@pluto-encrypted/database';
import Storage from '@pluto-encrypted/indexdb';
import {
  getDefaultCollections,
  DIDCollection,
  DIDPairCollection,
  MediatorCollection,
  PrivateKeyColletion,
  CredentialCollection,
  CredentialRequestMetadataCollection,
  LinkSecretColletion,
  MessageColletion,
} from '@pluto-encrypted/schemas';

export function usePluto() {
  const [pluto, setPluto] = useState<SDK.Domain.Pluto>();

  useEffect(() => {
    const connect = async () => {
      const db = await Database.createEncrypted<{
        dids: DIDCollection;
        didpairs: DIDPairCollection;
        mediators: MediatorCollection;
        privatekeys: PrivateKeyColletion;
        credentials: CredentialCollection;
        credentialrequestmetadatas: CredentialRequestMetadataCollection;
        linksecrets: LinkSecretColletion;
        messages: MessageColletion;
      }>({
        name: config.PLUTO_DB_NAME,
        encryptionKey: config.PLUTO_PASSWD,
        storage: Storage,
        collections: getDefaultCollections(),
      });
      setPluto(db);
      const backup = await db.backup();
      console.log(backup, '%%%%%%% BACKUP');
    };

    if (!pluto) connect();
  }, [pluto]);

  return { pluto };
}
