import { useEffect, useState } from "react";
import SDK from "@atala/prism-wallet-sdk";
import { usePluto } from "./pluto";

const defaultMediatorDID = "did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjoiaHR0cHM6Ly9iZXRhLW1lZGlhdG9yLmF0YWxhcHJpc20uaW8iLCJyIjpbXSwiYSI6WyJkaWRjb21tL3YyIl19";



export function useAgent() {
    const [agent, setAgent] = useState<SDK.Agent>();
    const [state, setState] = useState<string>('offline');
    const [error, setError] = useState<Error>();
    const { pluto } = usePluto();

    useEffect(() => {
        if (pluto) {
            const a = SDK.Agent.initialize({ mediatorDID: defaultMediatorDID, pluto });
            a.start()
              .then(st => setState(st))
              .catch(err => setError(err))
            setAgent(a);
        }

    }, [pluto])

    return {agent, state, error}
}