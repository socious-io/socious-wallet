import { useState } from 'react';
import './App.css';
import SDK from '@atala/prism-wallet-sdk';
import { useAgent, useConnection } from 'src/services/agent';
import { createDID } from 'src/services/dids';
import { usePluto } from 'src/services/pluto';

function Home() {
  const { pluto } = usePluto();
  const { agent, state, error, credentials } = useAgent();
  const { connectionStatus, connectionId } = useConnection();
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [did, setDID] = useState<SDK.Domain.DID>();

  const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
    uri: 'https://example.com/endpoint',
    accept: ['didcomm/v2'],
    routingKeys: ['did:example:somemediator#somekey'],
  });

  const newAccount = async () => {
    if (!agent) return;
    const result = await createDID(pluto, [exampleService]);
    setDID(result.did);
    setMnemonics(result.mnemonics);
  };

  return (
    <div className="App">
      <h1>Socious Wallet</h1>
      <h3>
        Agent status <span>{state}</span>
      </h3>
      {error && (
        <h3>
          Agent error <span>{error.message}</span>
        </h3>
      )}
      {mnemonics && <h3>{mnemonics.join(' ')}</h3>}
      {did && <p>{did?.toString()}</p>}

      {agent && !did && (
        <>
          <button onClick={newAccount}>Create Account</button>
        </>
      )}
      {connectionId && (
        <h3>
          connection estabblished at {connectionId} {connectionStatus}
        </h3>
      )}
      <h2>Credentials :</h2>
      <ul>
        {credentials.map((item) => (
          <li key={item.id}>
            <ul>
              {item.claims.map((record) => {
                const keys = Object.keys(record);
                return keys.map((k) => (
                  <li>
                    <b>{k}</b> {record[k]}
                  </li>
                ));
              })}
            </ul>
          </li> // Rendering each row as a list item
        ))}
      </ul>
    </div>
  );
}

export default Home;
