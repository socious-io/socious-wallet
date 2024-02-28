import SDK from '@atala/prism-wallet-sdk';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { createDID } from 'src/services/dids';
import { usePluto } from 'src/services/pluto';
import { useAppDispatch, useAppState } from 'src/store';
import MnemonicsDisplay from 'src/components/mnemonics';
import { Button } from 'react-bootstrap';

function Register() {
  const state = useAppState();
  const dispatch = useAppDispatch();
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

  if (state.did) return <Navigate to="/" />;

  const confirm = async () => {
    await pluto.storePrismDID(did, 0, pk, '');
    dispatch({ type: 'SET_DID', payload: did });
  };

  return (
    <>
      <MnemonicsDisplay mnemonics={mnemonics} readOnly={true} />
      <Button variant="primary" onClick={confirm} disabled={!did}>
        Confirm
      </Button>
    </>
  );
}

export default Register;
