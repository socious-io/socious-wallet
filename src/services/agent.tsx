import SDK from '@hyperledger/identus-edge-agent-sdk';
import { config } from 'src/config';
import { decodeJwtPayload } from 'src/utilities';
import { ActionType, StateType } from 'src/store/context/types';
import { addAction } from './datadog';

const OfferCredential = SDK.OfferCredential;
const IssueCredential = SDK.IssueCredential;
const RequestPresentation = SDK.RequestPresentation;

type Challenge = {
  type: string;
  [key: string]: any;
};

const handleMessages =
  (
    pluto: SDK.Domain.Pluto,
    agent: SDK.Agent,
    dispatch: React.Dispatch<ActionType>,
    stateRef: React.MutableRefObject<StateType>,
  ) =>
  async (newMessages: SDK.Domain.Message[]) => {
    const state = stateRef.current; // Access the latest state from the ref
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
        const credentials = await pluto.getAllCredentials();
        const requestPresentationMessage = RequestPresentation.fromMessage(requestPresentation);
        const data = requestPresentationMessage.attachments[0].data as any;
        let challenge: Challenge = { type: 'verification' };
        try {
          challenge = JSON.parse(data.data.options.challenge);
          challenge.type = challenge.type || 'verification';
        } catch {
          challenge.type = 'verification';
        }
        if (challenge.type.toLowerCase() === 'kyc') challenge.type = 'verification';
        addAction('messages', {
          message: newMessages,
          type: 'request-presentations',
          credential: state.selectedCredential,
        });
        localStorage.removeItem('listProcessing');
        dispatch({ type: 'SET_LIST_PROCESSING', payload: false });
        if (state.selectedCredential === undefined) {
          dispatch({
            type: 'SET_ERROR',
            payload: { err: new Error('could not find last credential'), section: 'find credential' },
          });
        } else {
          try {
            const presentation = await agent.createPresentationForRequestProof(
              requestPresentationMessage,
              state.selectedCredential,
            );
            await agent.sendMessage(presentation.makeMessage());
            dispatch({ type: 'VERIFIED_VC', payload: { type: state.selectedCredential.claims[0].type } });
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
        dispatch({ type: 'SET_LIST_PROCESSING', payload: false });
        if (!verfiedVC) {
          dispatch({ type: 'SET_VERIFICATION', payload: credential });
        }
        dispatch({ type: 'SET_CREDENTIALS', payload: [credential] });
      }
    }
  };

export async function startAgent(
  pluto: SDK.Domain.Pluto,
  dispatch: React.Dispatch<ActionType>,
  stateRef: React.MutableRefObject<StateType>,
) {
  const handleStart = async () => {
    console.log(`starting agent with mediator : ${config.MEDIATOR_DID}`);
    const a = SDK.Agent.initialize({ mediatorDID: SDK.Domain.DID.fromString(config.MEDIATOR_DID), pluto });
    a.addListener(SDK.ListenerKey.MESSAGE, handleMessages(pluto, a, dispatch, stateRef));
    await a.start();
    const mediator = a.currentMediatorDID;
    if (!mediator) {
      throw new Error('Mediator not available');
    }
    return a;
  };

  const agent = await handleStart();
  dispatch({ type: 'SET_AGENT', payload: agent });
  return { agent };
}
