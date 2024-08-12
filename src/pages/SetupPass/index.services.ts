import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';

export const useSetupPass = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { did } = state || {};

  return { translate, navigate, did };
};
