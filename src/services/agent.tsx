import { useEffect, useState } from 'react';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { config } from 'src/config';
import { decodeJwtPayload } from 'src/utilities';
import { ActionType } from 'src/store/context/types';
import { addAction } from './datadog';

const OfferCredential = SDK.OfferCredential;
const IssueCredential = SDK.IssueCredential;
const RequestPresentation = SDK.RequestPresentation;

const handleMessages =
  (pluto: SDK.Domain.Pluto, agent: SDK.Agent, dispatch: React.Dispatch<ActionType>) =>
  async (newMessages: SDK.Domain.Message[]) => {
    dispatch({ type: 'SET_NEW_MESSAGE', payload: newMessages });
    dispatch({ type: 'SET_LISTENER_STATE', payload: true });
    const credentialOffers = newMessages.filter(
      message => message.piuri === 'https://didcomm.org/issue-credential/3.0/offer-credential',
    );
    const issuedCredentials = newMessages.filter(
      message => message.piuri === 'https://didcomm.org/issue-credential/3.0/issue-credential',
    );
    const requestPresentations = newMessages.filter(
      message => message.piuri === 'https://didcomm.atalaprism.io/present-proof/3.0/request-presentation',
    );

    if (requestPresentations.length) {
      for (const requestPresentation of requestPresentations) {
        const lastCredentials = await pluto.getAllCredentials();
        // @FIXME: first credential is KYC we select it auto for not
        const lastCredential = lastCredentials[0];
        addAction('messages', {
          message: newMessages,
          type: 'request-presentations',
          credential: lastCredential,
        });
        const requestPresentationMessage = RequestPresentation.fromMessage(requestPresentation);
        if (lastCredential === undefined) {
          dispatch({
            type: 'SET_ERROR',
            payload: { err: new Error('could not find last credential'), section: 'find credential' },
          });
        } else {
          try {
            const presentation = await agent.createPresentationForRequestProof(
              requestPresentationMessage,
              lastCredential,
            );
            await agent.sendMessage(presentation.makeMessage());
          } catch (err) {
            console.log(err);
            dispatch({ type: 'SET_WARN', payload: { err, section: 'Send presentation Message' } });
          }
        }
      }
    }
    if (credentialOffers && credentialOffers.length) {
      for (const credentialOfferMessage of credentialOffers) {
        const credentialOffer = OfferCredential.fromMessage(credentialOfferMessage);
        const requestCredential = await agent.prepareRequestCredentialWithIssuer(credentialOffer);
        addAction('messages', {
          message: newMessages,
          type: 'offered-credential',
          credential: requestCredential,
        });
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

        const credentials = await pluto.getAllCredentials();
        const verfiedVC = credentials.filter(c => c.claims[0]?.type === 'verification')[0];
        const decoded = decodeJwtPayload((issueCredential.attachments[0].data as SDK.Domain.AttachmentBase64).base64);
        if (!verfiedVC) {
          if (decoded.vc.credentialSubject.type !== 'verification') break;
        } else {
          if (decoded.vc.credentialSubject.type === 'verification') break;
        }

        const credential = await agent.processIssuedCredentialMessage(issueCredential);
        addAction('messages', {
          message: newMessages,
          type: 'issued-credential',
          credential,
        });
        if (!verfiedVC) {
          dispatch({ type: 'SET_VERIFICATION', payload: credential });
        }
        dispatch({ type: 'SET_CREDENTIALS', payload: [credential] });
      }
    }
  };

export function useAgent(pluto: SDK.Domain.Pluto, dispatch: React.Dispatch<ActionType>) {
  const [agent, setAgent] = useState<SDK.Agent>();
  const [state, setState] = useState<string>('offline');

  useEffect(() => {
    const handleStart = async () => {
      const a = SDK.Agent.initialize({ mediatorDID: SDK.Domain.DID.fromString(config.MEDIATOR_DID), pluto });
      a.addListener(SDK.ListenerKey.MESSAGE, handleMessages(pluto, a, dispatch));
      setState(await a.start());
      const mediator = a.currentMediatorDID;
      if (!mediator) {
        throw new Error('Mediator not available');
      }
      setAgent(a);
      return a;
    };

    if (pluto) {
      handleStart().then(a => {
        console.log('agent started');
        dispatch({ type: 'SET_AGENT', payload: a });
      });
    }
  }, [pluto, dispatch]);

  return { agent, state };
}
