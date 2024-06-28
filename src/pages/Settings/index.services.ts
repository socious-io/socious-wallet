import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_VERSION } from 'src/config';
import { useAppContext } from 'src/store';

const useSettings = () => {
  const { state, dispatch } = useAppContext();
  const { pluto, did } = state || {};
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<{ name: 'remove' | ''; open: boolean }>({ name: '', open: false });
  const settingsItems = [
    {
      title: 'Remove wallet',
      action: () => setOpenModal({ name: 'remove', open: true }),
    },
    // {
    //   title: 'Contact us',
    //   action: () => console.log('contact'),
    // },
    // {
    //   title: 'Terms and Privacy Policy',
    //   action: () => console.log('terms'),
    // },
    {
      title: 'App Version',
      subtitle: APP_VERSION,
    },
  ];

  const handleCloseModal = () => setOpenModal({ ...openModal, open: false });

  const handleRemoveWallet = () => {
    dispatch({ type: 'SET_DID', payload: null });
    dispatch({ type: 'SET_MNEMONICS', payload: [] });
    //FIXME: purge wallet
    navigate('/intro');
  };

  return { settingsItems, openModal, handleCloseModal, handleRemoveWallet };
};

export default useSettings;
