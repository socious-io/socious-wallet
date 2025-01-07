import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const useCreated = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { hash } = useLocation();

  const cardContent = {
    ['']: {
      title: translate('created-started-title'),
      subtitle: translate('created-started-subtitle'),
      buttons: [
        {
          children: translate('created-started-button'),
          variant: 'primary',
          onClick: () => navigate('/', { replace: true }),
          className: 'fw-bold w-100 py-2',
        },
      ],
      contentClassName: 'justify-content-start',
    },
    ['#restored']: {
      title: translate('created-restore-title'),
      subtitle: translate('created-restore-subtitle'),
      buttons: [
        {
          children: translate('created-restore-button'),
          variant: 'primary',
          onClick: () => navigate('/', { replace: true }),
          className: 'fw-bold w-100 py-2',
        },
      ],
      contentClassName: 'justify-content-center',
    },
  };

  return {
    cardContent: cardContent[hash],
  };
};

export default useCreated;
