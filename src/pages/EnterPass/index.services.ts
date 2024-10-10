import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useEnterPass = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');

  const handlePasscode = () => {
    setPasscode(passcode);
    //TODO: check passcode with imported wallet
    navigate('/created#restored');
  };

  return {
    translate,
    navigate,
    handlePasscode,
  };
};
