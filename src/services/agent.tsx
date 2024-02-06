import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SDK from '@atala/prism-wallet-sdk';
import { usePluto } from './pluto';
import { config } from 'src/config';
import { useAppDispatch, useAppState } from 'src/store';

const OfferCredential = SDK.OfferCredential;
const IssueCredential = SDK.IssueCredential;
const RequestPresentation = SDK.RequestPresentation;

export function useAgent() {
  const [agent, setAgent] = useState<SDK.Agent>();
  const [state, setState] = useState<string>('offline');
  const [error, setError] = useState<Error>();
  const [warn, setWarn] = useState<string>();
  const { pluto } = usePluto();
  const [newMessage, setNewMessage] = React.useState<SDK.Domain.Message[]>([]);
  const [messages, setMessages] = React.useState<SDK.Domain.Message[]>([]);
  const appState = useAppState();
  const dispatch = useAppDispatch();

  const handleMessages = async (newMessages: SDK.Domain.Message[]) => {
    setNewMessage(newMessages);
    const joinedMessages = [...messages, ...newMessages];
    setMessages(joinedMessages);
    // setNewMessage(joinedMessages);

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
          setWarn(`error on request presentation message : ${err.message}`);
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
          setWarn(`error on credential offer  message : ${err.message}`);
        }
      }
    }
    if (issuedCredentials.length) {
      for (const issuedCredential of issuedCredentials) {
        const issueCredential = IssueCredential.fromMessage(issuedCredential);
        const credential = await agent.processIssuedCredentialMessage(issueCredential);
        dispatch({ type: 'SET_CREDENTIALS', payload: [...appState.credentials, credential] });
      }
    }
  };

  useEffect(() => {
    const handleStart = async () => {
      const a = SDK.Agent.initialize({ mediatorDID: config.MEDIATOR_DID, pluto });
      setState(await a.start());
      const mediator = a.currentMediatorDID;
      if (!mediator) {
        setError(new Error('Mediator not available'));
      }
      setAgent(a);
    };

    if (pluto) {
      handleStart().then(() => console.log('agent started'));
    }
  }, [pluto]);

  useEffect(() => {
    if (!agent) return;
    agent.addListener(SDK.ListenerKey.MESSAGE, handleMessages);

    return () => {
      agent.removeListener(SDK.ListenerKey.MESSAGE, handleMessages);
    };
  });

  return { agent, state, error, warn, newMessage };
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
      const res = await axios.post(`${config.ISSUER_AGENT}/prism-agent/connections`, {
        label: 'Socious wallet default',
      });

      setConnectionId(res.data.connectionId);
      setInviteURL(res.data.invitation.invitationUrl);
      console.log(res.data.invitation.invitationUrl, '----@@@');
      const parsed = await agent.parseOOBInvitation(new URL(res.data.invitation.invitationUrl));
      console.log(parsed, '@@@@@@@@@@@@@@');
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
