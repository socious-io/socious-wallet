import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from 'src/config';
import { useAppContext } from 'src/store/context';

const useSettings = () => {
  const { t: translate } = useTranslation();
  const { state } = useAppContext();
  const { device } = state || {};
  const [openModal, setOpenModal] = useState<{ name: 'remove' | ''; open: boolean }>({ name: '', open: false });
  const settingsItems = [
    {
      title: translate('settings-items.remove'),
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
      title: translate('settings-items.version'),
      subtitle: APP_VERSION,
    },
    {
      title: translate('settings-items.platform'),
      subtitle: device.platform,
    },
  ];

  const handleCloseModal = () => setOpenModal({ ...openModal, open: false });

  const handleRemoveWallet = async () => {
    const dbs = await indexedDB.databases();
    dbs.forEach(db => {
      indexedDB.deleteDatabase(db.name);
    });
    window.location.assign('/intro');
  };

  return { translate, settingsItems, openModal, handleCloseModal, handleRemoveWallet };
};

export default useSettings;
