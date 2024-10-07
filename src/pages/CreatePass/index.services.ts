import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';

export const useCreatePass = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { did } = state || {};
  const [passcode, setPasscode] = useState('');
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasscode = (pass: string) => {
    setPasscode(pass);
    setIsFirstStep(false);
  };

  const handleRetypePass = (pass: string) => {
    if (pass === passcode) {
      //FIXME: change the logic later
      localStorage.setItem('passcode', pass);
      navigate('/created');
    } else {
      setErrorMessage(translate('create-pass-error'));
    }
  };

  return {
    navigate,
    translate,
    did,
    handlePasscode,
    handleRetypePass,
    isFirstStep,
    setIsFirstStep,
    errorMessage,
    setErrorMessage,
  };
};
