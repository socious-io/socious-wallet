import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { passwordPattern } from 'src/utilities';
import { createDownloadLink } from 'src/utilities/downloadLink';
import { encrypt } from 'src/services/backup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type PasswordForm = {
  newPass: string;
  confirmPass: string;
};

export const useBackup = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [schema, setSchema] = useState(null);
  const mnemonics = localStorage.getItem('mnemonics')?.split(',') || [];

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

  const onSubmit = (formData: PasswordForm) => {
    const { confirmPass = '' } = formData || {};
    try {
      if (mnemonics.length && confirmPass) {
        const encoder = new TextEncoder();
        const password = encoder.encode(confirmPass);
        const encryptedData = encrypt(password, mnemonics);
        createDownloadLink(encryptedData, 'backup.txt');
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
  };
};
