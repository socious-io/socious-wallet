import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';

const useRecover = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did } = state || {};
  const [errorMessage, setErrorMessage] = useState<string>();

  const onClickUpload = async () => {
    setErrorMessage('');
    try {
      const result = await FilePicker.pickFiles();
      const file = result.files[0];
      if (file && file.name?.endsWith('.enc')) {
        let encryptedData: string;

        if (Capacitor.getPlatform() === 'web') {
          if (file.blob) {
            encryptedData = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsText(file.blob);
            });
          } else {
            throw new Error('No blob data available');
          }
        } else {
          if (file.path) {
            const fileContent = await Filesystem.readFile({
              path: file.path,
            });
            encryptedData = fileContent.data as string;
          } else {
            throw new Error('No file path available');
          }
        }

        if (encryptedData) {
          dispatch({ type: 'SET_ENCRYPTED_DATA', payload: encryptedData });
          navigate('/enter-pass');
        } else {
          setErrorMessage(translate('recover-error'));
        }
      } else {
        setErrorMessage(translate('recover-error'));
      }
    } catch (error) {
      setErrorMessage(translate('recover-error'));
    }
  };

  return { translate, navigate, did, onClickUpload, errorMessage };
};

export default useRecover;
