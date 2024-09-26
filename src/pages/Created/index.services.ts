import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const useCreated = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { hash } = useLocation();

  const cardContent = {
    ['']: {
      iconName: 'done',
      title: translate('created-started-title'),
      subtitle: translate('created-started-subtitle'),
      buttons: [
        {
          children: translate('created-started-button'),
          variant: 'primary',
          onClick: () => navigate('/'),
          className: 'w-100 border-solid',
        },
      ],
    },
    ['#restored']: {
      title: translate('created-restore-title'),
      subtitle: translate('created-restore-subtitle'),
      buttons: [
        {
          children: translate('created-restore-button'),
          variant: 'primary',
          onClick: () => navigate('/'),
          className: 'w-100 border-solid',
        },
      ],
    },
  };

  return {
    cardContent: cardContent[hash],
  };
};

export default useCreated;
