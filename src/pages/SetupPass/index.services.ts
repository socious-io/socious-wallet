import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useSetupPass = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  return { translate, navigate };
};
