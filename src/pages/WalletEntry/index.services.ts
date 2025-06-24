import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useWalletEntry = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const checkPassword = (enteredPass: string) => {
    const passcode = localStorage.getItem('passcode');
    console.log('Entered Pass:', enteredPass);
    if (enteredPass === passcode) {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/credentials', { replace: true });
    } else {
      setErrorMessage(translate('wallet-entry-error'));
    }
  };
  return { translate, errorMessage, setErrorMessage, checkPassword };
};
