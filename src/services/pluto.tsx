import { useEffect, useState } from "react";
import SDK from "@atala/prism-wallet-sdk";
import { Database } from "@pluto-encrypted/database";
import InMemory from "@pluto-encrypted/inmemory";
import { 
    getDefaultCollections,
    DIDCollection,
    DIDPairCollection,
    MediatorCollection,
    PrivateKeyColletion,
    CredentialCollection,
    CredentialRequestMetadataCollection,
    LinkSecretColletion,
    MessageColletion
} from "@pluto-encrypted/schemas";


export function usePluto() {
    const [pluto, setPluto] = useState<SDK.Domain.Pluto>()
    useEffect(() => {
        if (!pluto) {
          const defaultPassword = new Uint8Array(32).fill(1);
          Database.createEncrypted<{
            dids: DIDCollection;
            didpairs: DIDPairCollection;
            mediators: MediatorCollection;
            privatekeys: PrivateKeyColletion;
            credentials: CredentialCollection;
            credentialrequestmetadatas: CredentialRequestMetadataCollection;
            linksecrets: LinkSecretColletion;
            messages: MessageColletion;
          }>(
            {
                name: `my-db`,
                encryptionKey: defaultPassword,
                storage: InMemory,
                collections: getDefaultCollections()
            }
          ).then((db) => setPluto(db as any))
        }
        
      }, [pluto])

      return { pluto };
}