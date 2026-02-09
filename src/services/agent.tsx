import SDK from '@hyperledger/identus-sdk';
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

const waitFor = async (condition: () => boolean, interval = 100, timeout = 100000): Promise<void> => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};

const handleMessages =
  (
    pluto: SDK.Domain.Pluto,
    agent: SDK.Agent,
    dispatch: React.Dispatch<ActionType>,
    stateRef: React.MutableRefObject<StateType>,
  ) =>
  async (newMessages: SDK.Domain.Message[]) => {
    const state = stateRef.current;
    // eslint-disable-next-line no-console
    console.log(
      'Received messages:',
      newMessages.map(m => ({ piuri: m.piuri, from: m.from?.toString(), to: m.to?.toString(), id: m.id })),
    );
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
        if (challenge.type !== 'verification') dispatch({ type: 'SET_OPEN_CREDENTIAL_MODAL', payload: true });

        try {
          let selectedCredential = null;
          if (challenge.type !== 'verification') {
            await waitFor(() => stateRef.current.selectedCredential !== null);
            selectedCredential = stateRef.current.selectedCredential;
          } else {
            selectedCredential = state.credentials.filter(c => c.claims[0]?.type === 'verification')[0];
          }
          addAction('messages', {
            message: newMessages,
            type: 'request-presentations',
            credential: selectedCredential,
          });
          localStorage.removeItem('listProcessing');
          dispatch({ type: 'SET_LIST_PROCESSING', payload: false });

          if (selectedCredential === null) {
            dispatch({
              type: 'SET_ERROR',
              payload: { err: new Error('No credential selected'), section: 'select credential' },
            });
          } else {
            try {
              const presentation = await agent.createPresentationForRequestProof(
                requestPresentationMessage,
                selectedCredential,
              );
              await agent.sendMessage(presentation.makeMessage());
              dispatch({ type: 'VERIFIED_VC', payload: { type: selectedCredential.claims[0].type } });
            } catch (err) {
              console.error(err);
              dispatch({ type: 'SET_WARN', payload: { err, section: 'Send presentation Message' } });
            }
          }
        } catch (err) {
          dispatch({
            type: 'SET_ERROR',
            payload: { err, section: 'Waiting for credential selection' },
          });
        } finally {
          // Reset the modal and selected credential
          dispatch({ type: 'SET_OPEN_CREDENTIAL_MODAL', payload: false });
          dispatch({ type: 'SET_SELECTED_CREDENTIAL', payload: null });
        }
      }
    }
    if (credentialOffers && credentialOffers.length) {
      for (const credentialOfferMessage of credentialOffers) {
        try {
          // eslint-disable-next-line no-console
          console.log(
            'Processing credential offer message:',
            JSON.stringify({
              piuri: credentialOfferMessage.piuri,
              from: credentialOfferMessage.from?.toString(),
              body: credentialOfferMessage.body,
              attachmentsCount: credentialOfferMessage.attachments?.length,
            }),
          );
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
        } catch (err) {
          console.error('Error processing credential offer:', err);
          console.error('Offer message body:', JSON.stringify(credentialOfferMessage.body, null, 2));
          console.error('Offer message attachments:', JSON.stringify(credentialOfferMessage.attachments, null, 2));
        }
      }
    }
    if (issuedCredentials.length) {
      for (const issuedCredential of issuedCredentials) {
        try {
          // eslint-disable-next-line no-console
          console.log(
            'Processing issued credential message:',
            JSON.stringify({
              piuri: issuedCredential.piuri,
              from: issuedCredential.from?.toString(),
              to: issuedCredential.to?.toString(),
              body: issuedCredential.body,
              attachmentsCount: issuedCredential.attachments?.length,
              attachmentFormats: issuedCredential.attachments?.map((a: any) => a.format),
            }),
          );
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
        } catch (err) {
          console.error('Error processing issued credential:', err);
          console.error('Message details:', JSON.stringify(issuedCredential, null, 2));
        }
      }
    }
  };

export async function startAgent(
  pluto: SDK.Domain.Pluto,
  dispatch: React.Dispatch<ActionType>,
  stateRef: React.MutableRefObject<StateType>,
) {
  const handleStart = async () => {
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
