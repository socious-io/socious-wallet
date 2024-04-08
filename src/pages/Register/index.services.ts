import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SDK from '@atala/prism-wallet-sdk';
import { useAppContext } from 'src/store';
import { createDID } from 'src/services/dids';

const useRegister = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, mnemonics, pluto } = state || {};

  useEffect(() => {
    if (!pluto) return;
    if (mnemonics.length) return;

    const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
      uri: 'https://example.com/endpoint',
      accept: ['didcomm/v2'],
      routingKeys: ['did:example:somemediator#somekey'],
    });

    createDID([exampleService]).then(({ mnemonics }) => {
      dispatch({ type: 'SET_MNEMONICS', payload: mnemonics });
    });
  }, [pluto, mnemonics.length, dispatch]);

  const onSave = async () => {
    navigate('/confirm');
  };

  return {
    did,
    mnemonics,
    onSave,
  };
};

export default useRegister;
