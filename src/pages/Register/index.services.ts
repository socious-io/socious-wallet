import { useEffect, useState } from 'react';
import SDK from '@atala/prism-wallet-sdk';
import { useAppContext } from 'src/store';
import { usePluto } from 'src/services/pluto';
import { createDID } from 'src/services/dids';

const useRegister = () => {
  const { state, dispatch } = useAppContext();
  const { pluto } = usePluto();
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [did, setDID] = useState<SDK.Domain.DID>();
  const [pk, setPK] = useState<SDK.Domain.PrivateKey>();

  useEffect(() => {
    if (!pluto) return;
    if (state.did) return;

    const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
      uri: 'https://example.com/endpoint',
      accept: ['didcomm/v2'],
      routingKeys: ['did:example:somemediator#somekey'],
    });

    createDID([exampleService]).then(({ mnemonics, did, privateKey }) => {
      setMnemonics(mnemonics);
      setDID(did);
      setPK(privateKey);
    });
  }, [pluto, state.did, dispatch]);

  const onSave = async () => {
    await pluto.storePrismDID(did, 0, pk, 'master');
    dispatch({ type: 'SET_DID', payload: did });
  };

  return {
    state,
    mnemonics,
    onSave,
    did,
  };
};

export default useRegister;
