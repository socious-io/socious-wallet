import React, { useEffect, useState } from 'react';
import SDK from '@atala/prism-wallet-sdk';
import { config } from 'src/config';
import { Action } from 'src/store/types';

const OfferCredential = SDK.OfferCredential;
const IssueCredential = SDK.IssueCredential;
const RequestPresentation = SDK.RequestPresentation;

const handleMessages =
  (pluto: SDK.Domain.Pluto, agent: SDK.Agent, dispatch: React.Dispatch<Action>) =>
  async (newMessages: SDK.Domain.Message[]) => {
    console.log('new message -> ', newMessages)
    dispatch({ type: 'SET_NEW_MESSAGE', payload: newMessages });

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
          if (lastCredential === undefined)
            dispatch({
              type: 'SET_ERROR',
              payload: { err: new Error('could not find last credential'), section: 'find credential' },
            });

          const presentation = await agent.createPresentationForRequestProof(
            requestPresentationMessage,
            lastCredential,
          );
          await agent.sendMessage(presentation.makeMessage());
        } catch (err) {
          dispatch({ type: 'SET_WARN', payload: { err, section: 'Send presentation Message' } });
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
          dispatch({ type: 'SET_WARN', payload: { err, section: 'Send accept offer' } });
        }
      }
    }
    if (issuedCredentials.length) {
      for (const issuedCredential of issuedCredentials) {
        const issueCredential = IssueCredential.fromMessage(issuedCredential);
        const credential = await agent.processIssuedCredentialMessage(issueCredential);
        dispatch({ type: 'SET_CREDENTIALS', payload: [credential] });
      }
    }
  };

export function useAgent(pluto: SDK.Domain.Pluto, dispatch: React.Dispatch<Action>) {
  const [agent, setAgent] = useState<SDK.Agent>();
  const [state, setState] = useState<string>('offline');

  useEffect(() => {
    const handleStart = async () => {
      const a = SDK.Agent.initialize({ mediatorDID: config.MEDIATOR_DID, pluto });

      setState(await a.start());
      const mediator = a.currentMediatorDID;
      if (!mediator) {
        throw new Error('Mediator not available');
      }
      setAgent(a);
      return a;
    };

    if (pluto) {
      handleStart().then((a) => {
        console.log('agent started');
        dispatch({ type: 'SET_AGENT', payload: a });
        a.addListener(SDK.ListenerKey.MESSAGE, handleMessages(pluto, a, dispatch));
      });
    }
  }, [pluto, dispatch]);

  return { agent, state };
}
