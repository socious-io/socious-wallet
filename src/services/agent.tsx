import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SDK from '@atala/prism-wallet-sdk';
import { usePluto } from './pluto';

const OfferCredential = SDK.OfferCredential;
const IssueCredential = SDK.IssueCredential;
const RequestPresentation = SDK.RequestPresentation;

const defaultMediatorDID =
  'did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjoiaHR0cHM6Ly9iZXRhLW1lZGlhdG9yLmF0YWxhcHJpc20uaW8iLCJyIjpbXSwiYSI6WyJkaWRjb21tL3YyIl19';

const issuerAgentBaseURL = 'http://localhost:8000';

export function useAgent() {
  const [agent, setAgent] = useState<SDK.Agent>();
  const [state, setState] = useState<string>('offline');
  const [error, setError] = useState<Error>();
  const { pluto } = usePluto();
  const [newMessage, setNewMessage] = React.useState<any>([]);
  const [messages, setMessages] = React.useState<SDK.Domain.Message[]>([]);
  const [credentials, setCredentials] = useState<SDK.Domain.Credential[]>([]);

  const handleMessages = async (newMessages: SDK.Domain.Message[]) => {
    const joinedMessages = [...messages, ...newMessages];
    console.log('new message : ', newMessages);
    setMessages(joinedMessages);
    setNewMessage(joinedMessages.map(() => ''));

    const credentialOffers = newMessages.filter(
      (message) => message.piuri === 'https://didcomm.org/issue-credential/3.0/offer-credential',
    );
    const issuedCredentials = newMessages.filter(
      (message) => message.piuri === 'https://didcomm.org/issue-credential/3.0/issue-credential',
    );
    const requestPresentations = newMessages.filter(
      (message) => message.piuri === 'https://didcomm.atalaprism.io/present-proof/3.0/request-presentation',
    );

    if (requestPresentations.length) {
      for (const requestPresentation of requestPresentations) {
        const lastCredentials = await pluto.getAllCredentials();
        const lastCredential = lastCredentials.at(-1);
        const requestPresentationMessage = RequestPresentation.fromMessage(requestPresentation);
        try {
          if (lastCredential === undefined) throw new Error('last credential not found');

          const presentation = await agent.createPresentationForRequestProof(
            requestPresentationMessage,
            lastCredential,
          );
          await agent.sendMessage(presentation.makeMessage());
        } catch (err) {
          console.log('continue after err', err);
        }
      }
    }
    if (credentialOffers && credentialOffers.length) {
      for (const credentialOfferMessage of credentialOffers) {
        const credentialOffer = OfferCredential.fromMessage(credentialOfferMessage);
        const requestCredential = await agent.prepareRequestCredentialWithIssuer(credentialOffer);

        try {
          await agent.sendMessage(requestCredential.makeMessage());
        } catch (err) {
          console.log('continue after error', err);
        }
      }
    }
    if (issuedCredentials.length) {
      for (const issuedCredential of issuedCredentials) {
        const issueCredential = IssueCredential.fromMessage(issuedCredential);
        const cred = await agent.processIssuedCredentialMessage(issueCredential);
        setCredentials([...credentials, cred]);
      }
    }
  };

  useEffect(() => {
    const handleStart = async () => {
      const a = SDK.Agent.initialize({ mediatorDID: defaultMediatorDID, pluto });
      setState(await a.start());
      const mediator = a.currentMediatorDID;
      if (!mediator) {
        throw new Error('Mediator not available');
      }
      setAgent(a);
    };

    if (pluto) {
      handleStart().then(() => console.log('agent started'));
      pluto.getAllCredentials().then((rows) => setCredentials(rows));
    }
  }, [pluto]);

  useEffect(() => {
    if (!agent) return;
    agent.addListener(SDK.ListenerKey.MESSAGE, handleMessages);

    return () => {
      agent.removeListener(SDK.ListenerKey.MESSAGE, handleMessages);
    };
  });

  return { agent, state, error, credentials };
}

export function useConnection() {
  const [connectionId, setConnectionId] = useState<string>();
  const [inviteURL, setInviteURL] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState<'NOT_ESTABLISHED' | 'ESTABLISHED'>('NOT_ESTABLISHED');

  const { agent, state } = useAgent();

  useEffect(() => {
    const connect = async () => {
      // TODO: should create only on connection per wallet
      // TODO: use configured API KEY
      const res = await axios.post(`${issuerAgentBaseURL}/prism-agent/connections`, {
        label: 'Socious wallet default',
      });

      setConnectionId(res.data.connectionId);
      setInviteURL(res.data.invitation.invitationUrl);
      const parsed = await agent.parseOOBInvitation(new URL(res.data.invitation.invitationUrl));
      await agent.acceptInvitation(parsed);
      setConnectionStatus('ESTABLISHED');
    };
    if (state === 'running') connect().then(() => console.log('connection established'));
  }, [agent, state]);

  return {
    connectionId,
    inviteURL,
    setConnectionStatus,
    connectionStatus,
  };
}
