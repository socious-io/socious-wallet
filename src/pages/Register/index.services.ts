import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SDK from '@hyperledger/identus-sdk';
import { useAppContext } from 'src/store/context';
import { createDID } from 'src/services/dids';

const useRegister = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, mnemonics, pluto } = state || {};
  const [currentDID, setCurrentDID] = useState<SDK.Domain.DID | undefined>();
  const [privateKey, setPrivateKey] = useState<SDK.Domain.PrivateKey | undefined>();

  useEffect(() => {
    if (!pluto) return;
    if (mnemonics.length) return;

    const service = new SDK.Domain.DIDDocument.Service(
      'didcomm',
      ['DIDCommMessaging'],
      new SDK.Domain.DIDDocument.ServiceEndpoint(
        'https://agent.socious.io',
        ['didcomm/v2'],
        ['did:example:somemediator#somekey'],
      ),
    );

    createDID([service]).then(({ mnemonics, privateKey, did }) => {
      dispatch({ type: 'SET_MNEMONICS', payload: mnemonics });
      setCurrentDID(did);
      setPrivateKey(privateKey);
    });
  }, [pluto, mnemonics.length, dispatch]);

  const onSave = async () => {
    try {
      await pluto.storeDID(currentDID, privateKey, 'master');
      dispatch({ type: 'SET_DID', payload: currentDID });
      navigate('/created');
    } catch (e) {
      console.error(e, 'error in saving seed phrase');
    }
  };

  return {
    did,
    mnemonics,
    onSave,
  };
};

export default useRegister;
