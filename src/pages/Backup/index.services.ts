import { useEffect, useState } from 'react';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { passwordPattern } from 'src/utilities';
import { useAppContext } from 'src/store/context';
import { createDownloadLink } from 'src/utilities/downloadLink';
import { backup, encrypt } from 'src/services/backup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createDID } from 'src/services/dids';
import * as yup from 'yup';

type PasswordForm = {
  newPass: string;
  confirmPass: string;
};

export const useBackup = () => {
  const { t: translate } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { pluto, did } = state;
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [schema, setSchema] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [mnemonics, setMnemonics] = useState(localStorage.getItem('mnemonics')?.split(',') || []);
  const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
    uri: 'https://example.com/endpoint',
    accept: ['didcomm/v2'],
    routingKeys: ['did:example:somemediator#somekey'],
  });

  useEffect(() => {
    if (!mnemonics.length) createNewDID();
  }, [mnemonics]);

  useEffect(() => {
    if (i18next.isInitialized) {
      setSchema(createSchema());
    } else {
      i18next.on('initialized', () => {
        setSchema(createSchema());
      });
    }
  }, []);

  const createSchema = () =>
    yup.object().shape({
      newPass: yup
        .string()
        .required(i18next.t('backup-form.new-pass-error1'))
        .min(8, i18next.t('backup-form.new-pass-error2'))
        .matches(passwordPattern, i18next.t('backup-form.new-pass-error3')),
      confirmPass: yup
        .string()
        .required(i18next.t('backup-form.confirm-pass-error1'))
        .oneOf([yup.ref('newPass')], i18next.t('backup-form.confirm-pass-error2')),
    });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver<PasswordForm>(schema),
  });

  const createNewDID = async () => {
    // TODO: way to delete current did or change it to new one
    try {
      const { mnemonics: newMnemonics, privateKey: newPrivateKey, did: newDID } = await createDID([exampleService]);
      await pluto.storeDID(newDID, newPrivateKey, 'master');
      dispatch({ type: 'SET_DID', payload: newDID });
      //FIXME: save into local storage for now
      localStorage.setItem('mnemonics', newMnemonics.toString());
      setMnemonics(newMnemonics);
      console.log('New DID created');
    } catch (e) {
      console.log('Error in creating new DID', e);
    }
  };

  const onSubmit = async (formData: PasswordForm) => {
    const { confirmPass = '' } = formData || {};
    if (!mnemonics.length) await createNewDID();
    try {
      if (mnemonics.length && confirmPass) {
        const encoder = new TextEncoder();
        const password = encoder.encode(confirmPass);
        const encryptedData = encrypt(password, mnemonics.join(','));
        backup(pluto, did);
        createDownloadLink(encryptedData, `walletBackup-${did.methodId.slice(0, 8)}${did.methodId.slice(-8)}.enc`);
        setDisabled(true);
      }
    } catch {
      setErrorMessage(translate('backup-error'));
    }
  };

  return {
    translate,
    navigate,
    register,
    errors,
    handleSubmit,
    onSubmit,
    errorMessage,
    disabled,
  };
};
