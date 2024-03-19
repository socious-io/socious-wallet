import { useLocation, useNavigate } from 'react-router-dom';

const useCreated = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();

  const cardContent = {
    ['']: {
      iconName: 'done',
      title: 'You are all done!',
      subtitle: 'You can now use your wallet.',
      buttons: [
        {
          children: 'Get started',
          variant: 'primary',
          onClick: () => navigate('/'),
          className: 'w-100 border-solid',
        },
      ],
    },
    ['#restored']: {
      title: 'Wallet restored!',
      subtitle: 'You can now use your wallet.',
      buttons: [
        {
          children: 'Continue',
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
