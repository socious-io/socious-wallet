import { ChangeEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';

const useRecover = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did } = state || {};
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  const onClickUpload = () => {
    setErrorMessage('');
    inputRef.current.click();
  };

  const onUploadWallet = (event: ChangeEvent<HTMLInputElement>) => {
    const { files = [] } = event.target;
    const file = files[0];
    if (file && file.name.endsWith('.enc')) {
      const reader = new FileReader();
      reader.onload = e => {
        const encryptedData = e.target?.result as string;
        if (encryptedData) {
          dispatch({ type: 'SET_ENCRYPTED_DATA', payload: encryptedData });
          navigate('/enter-pass');
        }
      };
      reader.readAsText(file);
    } else {
      setErrorMessage(translate('recover-error'));
    }
  };

  return { translate, navigate, did, inputRef, onClickUpload, onUploadWallet, errorMessage };
};

export default useRecover;
