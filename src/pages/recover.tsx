import MnemonicsDisplay from 'src/components/mnemonics';
import SDK from '@atala/prism-wallet-sdk';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import { recoverDID } from 'src/services/dids';
import { useAppDispatch } from 'src/store';
import { connect } from 'src/services/pluto';
import { config } from 'src/config';
import { decrypt } from 'src/services/backup';
import axios from 'axios';

function Recover() {
  const dispatch = useAppDispatch();
  const [mns, setMns] = useState<string[]>([]);

  const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
    uri: 'https://example.com/endpoint',
    accept: ['didcomm/v2'],
    routingKeys: ['did:example:somemediator#somekey'],
  });

  const getMnemonics = (mnemonics: string[]) => {
    setMns(mnemonics);
  };

  const confirm = async () => {
    const { did, privateKey } = await recoverDID(mns, [exampleService]);
    const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
    const res = await axios.get(`${config.BACKUP_AGENT}/fetch/${did.methodId}.bin`, { headers });
    const strObj = decrypt(privateKey.raw, res.data);
    const db = await connect(JSON.parse(strObj));
    dispatch({ type: 'SET_PLUTO', payload: db });
    // Note: It must be reload and redirect this is why it use window.location instead of react router
    window.location.assign('/');
  };

  return (
    <>
      <MnemonicsDisplay mnemonics={[]} setMnemonics={getMnemonics} />
      <Button variant="primary" onClick={confirm} disabled={mns.length < 24}>
        Confirm
      </Button>
    </>
  );
}

export default Recover;
