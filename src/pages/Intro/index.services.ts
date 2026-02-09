import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import SDK from '@hyperledger/identus-sdk';
import { createDID } from 'src/services/dids';

export const useIntro = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, mnemonics, pluto } = state || {};

  const onCreateWallet = async () => {
    try {
      if (!pluto || mnemonics.length) return;
      const exampleService = new SDK.Domain.DIDDocument.Service(
        'didcomm',
        ['DIDCommMessaging'],
        new SDK.Domain.DIDDocument.ServiceEndpoint(
          'https://example.com/endpoint',
          ['didcomm/v2'],
          ['did:example:somemediator#somekey'],
        ),
      );
      const { mnemonics: newMnemonics, privateKey: newPrivateKey, did: newDID } = await createDID([exampleService]);
      dispatch({ type: 'SET_MNEMONICS', payload: newMnemonics });
      //FIXME: save into local storage for now
      localStorage.setItem('mnemonics', newMnemonics.toString());
      await pluto.storeDID(newDID, newPrivateKey, 'master');
      dispatch({ type: 'SET_DID', payload: newDID });
      navigate('/setup-pass');
    } catch (e) {
      console.error('Error in creating wallet or saving seed phrase:', e);
    }
  };

  return { translate, navigate, did, onCreateWallet };
};
