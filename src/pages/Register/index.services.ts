import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { useAppContext } from 'src/store';
import { createDID } from 'src/services/dids';
import { PrivateKey } from '@hyperledger/identus-edge-agent-sdk/build/typings/domain';

const useRegister = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, mnemonics, pluto } = state || {};
  const [currentDID, setCurrentDID] = useState<SDK.Domain.DID | undefined>();
  const [privateKey, setPrivateKey] = useState<PrivateKey | undefined>();

  useEffect(() => {
    if (!pluto) return;
    if (mnemonics.length) return;

    const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
      uri: 'https://example.com/endpoint',
      accept: ['didcomm/v2'],
      routingKeys: ['did:example:somemediator#somekey'],
    });

    createDID([exampleService]).then(({ mnemonics, privateKey, did }) => {
      dispatch({ type: 'SET_MNEMONICS', payload: mnemonics });
      setCurrentDID(did);
      setPrivateKey(privateKey);
    });
  }, [pluto, mnemonics.length, dispatch]);

  const onSave = async () => {
    try {
      await pluto.storePrismDID(currentDID, privateKey, 'master');
      dispatch({ type: 'SET_DID', payload: currentDID });
      navigate('/created');
    } catch (e) {
      console.log(e, 'error in saving seed phrase');
    }
  };

  return {
    did,
    mnemonics,
    onSave,
  };
};

export default useRegister;
