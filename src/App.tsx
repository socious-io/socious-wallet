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
import { App as CapApp } from '@capacitor/app';
init();

function App() {
  const { language } = useSelector((state: RootState) => state.language);

  useEffect(() => {
    i18next.changeLanguage(language);
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
