import { useState } from "react";
import "./App.css";
import SDK from "@atala/prism-wallet-sdk";
import { useAgent } from "./services/agent";
import { createDID } from "./services/dids";



function App() {
  const {agent, state, error} = useAgent();
  const [mnemonics, setMnemonics] = useState<string[]>([]);
    const [did, setDID] = useState<SDK.Domain.DID>()

  const exampleService = new SDK.Domain.Service("didcomm", ["DIDCommMessaging"], {
    uri: "https://example.com/endpoint",
    accept: ["didcomm/v2"],
    routingKeys: ["did:example:somemediator#somekey"],
  });

  const newAccount = async () => {
    if (!agent) return
    const result = await createDID(agent, [exampleService]);
    setDID(result.did);
    setMnemonics(result.mnemonics);
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
    </div>
  );
}

export default App;
