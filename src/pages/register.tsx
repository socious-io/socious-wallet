import SDK from '@atala/prism-wallet-sdk';
import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import { createDID } from 'src/services/dids';
import { usePluto } from 'src/services/pluto';
import { useAppState } from 'src/store';

function Register() {
    const state = useAppState();
    const {pluto} = usePluto();
    const [mnemonics, setMnemonics] = useState<string[]>([]);

    
    
    useEffect(() => {
        if (!pluto) return;
        if (state.did) return;

        const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
            uri: 'https://example.com/endpoint',
            accept: ['didcomm/v2'],
            routingKeys: ['did:example:somemediator#somekey'],
          });    
        createDID(pluto, [exampleService]).then(r => {
            setMnemonics(r.mnemonics)
        });

    }, [pluto, state.did])

    if (state.did) return <Navigate to='/' />;

    return (
        <>
            {mnemonics.join(' ')}
        </>
    )
}




export default Register;