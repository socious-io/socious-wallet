import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from 'src/router';
import i18next from 'i18next';
import { useSelector } from 'react-redux';
import { AppProvider } from './store/context';
import { RootState } from './store/redux';
import { Backup } from 'src/services/backup';
import { init } from './services/datadog';
import { Activation } from 'src/services/activation';
import 'src/translations/i18n';
import { getSystemLanguage } from './utilities';
init();

function App() {
  const { language } = useSelector((state: RootState) => state.language);

  const setLanguage = async () => {
    const systemLanguage = await getSystemLanguage();
    i18next.changeLanguage(language || systemLanguage);
  };
  useEffect(() => {
    setLanguage();
  }, [language]);

  return (
    <AppProvider>
      <Backup />
      <div className="app__container">
        <Activation />
        <RouterProvider router={routes} />
      </div>
    </AppProvider>
  );
}

export default App;
