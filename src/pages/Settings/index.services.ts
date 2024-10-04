import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useAppContext } from 'src/store/context';
import { APP_VERSION } from 'src/config';
import { RootState } from 'src/store/redux';
import { setLanguage, setSystemLanguage } from 'src/store/redux/language.reducers';
import { languages } from 'src/constants/languages';

const useSettings = () => {
  const { t: translate } = useTranslation();
  const dispatch = useDispatch();
  const { language, system } = useSelector((state: RootState) => state.language);
  const { state } = useAppContext();
  const { device } = state || {};
  const [openModal, setOpenModal] = useState<{ name: 'remove' | 'language' | ''; open: boolean }>({
    name: '',
    open: false,
  });
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
      title: translate('settings-items.language'),
      value: system ? translate('settings-items.automatic') : languages.find(lang => lang.value === language)?.original,
      action: () => setOpenModal({ name: 'language', open: true }),
    },
    {
      title: translate('settings-items.version'),
      subtitle: APP_VERSION,
    },
    {
      title: translate('settings-items.platform'),
      subtitle: device.platform,
    },
  ];

  useEffect(() => {
    if (!language) {
      const systemLanguage = languages.find(lang => lang.system === navigator.language)?.value || 'en';
      dispatch(setSystemLanguage(systemLanguage));
    }
  }, [language]);

  const handleCloseModal = () => setOpenModal({ ...openModal, open: false });

  const isSystemLanguage = language => navigator.language === language;

  const onChangeLanguage = (value: string) => {
    dispatch(setLanguage(value));
    handleCloseModal();
  };

  const handleRemoveWallet = async () => {
    const dbs = await indexedDB.databases();
    dbs.forEach(db => {
      indexedDB.deleteDatabase(db.name);
    });
    window.location.assign('/intro');
  };

  return {
    translate,
    settingsItems,
    languages,
    isSystemLanguage,
    onChangeLanguage,
    openModal,
    handleCloseModal,
    handleRemoveWallet,
  };
};

export default useSettings;
