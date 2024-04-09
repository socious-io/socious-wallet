import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from 'src/store';
import { arraysEqual } from 'src/utilities';
import { recoverDID } from 'src/services/dids';
import SDK from '@atala/prism-wallet-sdk';

const useConfirm = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { mnemonics, pluto } = state || {};
  const [mns, setMns] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const disabledConfirm = mns.length < 24;
  const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
    uri: 'https://example.com/endpoint',
    accept: ['didcomm/v2'],
    routingKeys: ['did:example:somemediator#somekey'],
  });

  const handleMnemonicValue = (value: string) => {
    const updatedMnemonics = value.split(' ');
    setMns(updatedMnemonics);
  };

  const onConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabledConfirm) return;
    try {
      if (arraysEqual(mns, mnemonics)) {
        const { did: currentDID, privateKey } = await recoverDID(mns, [exampleService]);
        await pluto.storePrismDID(currentDID, privateKey, 'master');
        dispatch({ type: 'SET_DID', payload: currentDID });
        navigate('/created');
      } else {
        setErrorMessage('The Verify Recovery Phrase does not match.');
      }
    } catch (e) {
      console.log(e, '@@@@###');
      setErrorMessage(e.message);
    }
  };

  const closeError = () => {
    setErrorMessage('');
  };

  return {
    handleMnemonicValue,
    onConfirm,
    disabledConfirm,
    errorMessage,
    closeError,
  };
};

export default useConfirm;
