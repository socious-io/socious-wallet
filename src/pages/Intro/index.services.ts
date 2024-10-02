import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { createDID } from 'src/services/dids';

export const useIntro = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, mnemonics, pluto } = state || {};
  //FIXME: localStorage
  const passcode = localStorage.getItem('passcode') || '';

  const onCreateWallet = async () => {
    try {
      if (!pluto || mnemonics.length) return;
      const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
        uri: 'https://example.com/endpoint',
        accept: ['didcomm/v2'],
        routingKeys: ['did:example:somemediator#somekey'],
      });
      const {
        mnemonics: currentMnemonics,
        privateKey: currentPrivateKey,
        did: currentDID,
      } = await createDID([exampleService]);
      dispatch({ type: 'SET_MNEMONICS', payload: mnemonics });
      //FIXME: save into local storage for now
      localStorage.setItem('mnemonics', currentMnemonics.toString());
      await pluto.storePrismDID(currentDID, currentPrivateKey, 'master');
      dispatch({ type: 'SET_DID', payload: currentDID });
      navigate('/setup-pass');
    } catch (e) {
      console.error('Error in creating wallet or saving seed phrase:', e);
    }
  };

  return { translate, navigate, did, onCreateWallet, passcode };
};
