import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SDK from '@hyperledger/identus-edge-agent-sdk';
import { decrypt, fetchBackup, restoreIndexedDBs } from 'src/services/backup';
import { recoverDID } from 'src/services/dids';
import { useAppContext } from 'src/store/context';
import { passwordPattern } from 'src/utilities';
import { config } from 'src/config';
import { Capacitor } from '@capacitor/core';

export const useEnterPass = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, encrypted, pluto } = state || {};
  const [schema, setSchema] = useState(null);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
    uri: 'https://example.com/endpoint',
    accept: ['didcomm/v2'],
    routingKeys: ['did:example:somemediator#somekey'],
  });

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
      password: yup
        .string()
        .required(i18next.t('enter-pass-form.input-error1'))
        .min(8, i18next.t('enter-pass-form.input-error2'))
        .matches(passwordPattern, i18next.t('enter-pass-form.input-error3')),
    });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver<{ password: string }>(schema),
  });
  const password = watch('password');

  const onSubmit = async (formData: { password: string }) => {
    setImporting(true);
    const { password } = formData || {};
    try {
      const encoder = new TextEncoder();
      const encodedPassword = encoder.encode(password);
      const decoded = Capacitor.getPlatform() === 'web' ? encrypted : atob(encrypted);
      const decryptedData = decrypt(encodedPassword, decoded);
      const mnemonics = decryptedData.split(',');
      if (mnemonics.length) {
        const { did: newDID, privateKey, mnemonics: newMnemonics } = await recoverDID(mnemonics, [exampleService]);

        dispatch({ type: 'SET_MNEMONICS', payload: newMnemonics });

        const backup = await fetchBackup(newDID.methodId, privateKey);
        await pluto.restore(JSON.parse(backup));
        await pluto.start();

        localStorage.setItem('mnemonics', newMnemonics.join(','));
        window.location.replace('/setup-pass#restored');
      }
    } catch (err) {
      console.error('[ERROR] Restore process failed:', err);
      setErrorMessage(`${translate('enter-pass-form.submit-error')} ${err}`);
    }
    setImporting(false);
  };

  return {
    translate,
    navigate,
    did,
    encrypted,
    register,
    errors,
    password,
    handleSubmit,
    onSubmit,
    errorMessage,
    importing,
  };
};
