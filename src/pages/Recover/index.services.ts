import { useState } from 'react';
import SDK from '@atala/prism-wallet-sdk';
import axios from 'axios';
import { useAppContext } from 'src/store';
import { config } from 'src/config';
import { connect } from 'src/services/pluto';
import { recoverDID } from 'src/services/dids';
import { decrypt } from 'src/services/backup';

const useRecover = () => {
  const { dispatch } = useAppContext();
  const [mns, setMns] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
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
      const { did, privateKey } = await recoverDID(mns, [exampleService]);
      const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
      const res = await axios.get(`${config.BACKUP_AGENT}/fetch/${did.methodId}.bin`, { headers });
      const strObj = decrypt(privateKey.raw, res.data);
      const db = await connect(JSON.parse(strObj));
      dispatch({ type: 'SET_PLUTO', payload: db });
      // Note: It must be reload and redirect this is why it use window.location instead of react router
      window.location.assign('/created#restored');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const closeError = () => {
    setErrorMessage(undefined);
  };

  return {
    handleMnemonicValue,
    onConfirm,
    disabledConfirm,
    errorMessage,
    closeError,
  };
};

export default useRecover;
