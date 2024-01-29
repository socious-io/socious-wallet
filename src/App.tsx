import { useEffect, useState } from "react";
import "./App.css";
import SDK from "@atala/prism-wallet-sdk";
import { useAgent, useConnection } from "./services/agent";
import { createDID } from "./services/dids";
import { usePluto } from "./services/pluto";



function App() {
  const {pluto} = usePluto();
  const {agent, state, error} = useAgent();
  const {setConnectionStatus, connectionStatus, connectionId, inviteURL} = useConnection();
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [did, setDID] = useState<SDK.Domain.DID>()

  const exampleService = new SDK.Domain.Service("didcomm", ["DIDCommMessaging"], {
    uri: "https://example.com/endpoint",
    accept: ["didcomm/v2"],
    routingKeys: ["did:example:somemediator#somekey"],
  });

  useEffect(() => {
    if (pluto) {
      pluto.getAllPrismDIDs().then(rows => {
        if (rows.length > 0) setDID(rows[0].did)
      })
    }
  }, [pluto])

  const newAccount = async () => {
    if (!agent) return
    const result = await createDID(pluto, [exampleService]);
    setDID(result.did);
    setMnemonics(result.mnemonics);
  }


  const connect = async () => {
    console.log('----------@@@1')
    if (!inviteURL) {
      alert('no connection to establish');
      return;
    }
    console.log('----------@@@2')
    
    console.log('----------------------@@@3')
    // setConnectionStatus('ESTABLISHED')    
  }

  

  return (
    <div className="App">
      <h1>Socious Wallet</h1>
      <h3>Agent status <span>{state}</span></h3>
      {error && <h3>Agent error <span>{error.message}</span></h3>}
      {mnemonics && <h3>{mnemonics.join(' ')}</h3>}
      {did && <p>{did?.toString()}</p>}

      {agent && !did && <>          
          <button onClick={newAccount}>
              Create Account
          </button>
        </>}
      {inviteURL && connectionStatus !== 'ESTABLISHED' && <button onClick={connect}>connect</button>}
      {connectionId && <h3>connection estabblished at {connectionId} {connectionStatus}</h3>}
    </div>
  );
}

export default App;
