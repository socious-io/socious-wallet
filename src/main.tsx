import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import enMessages from '@/locales/en.json';

import router from './Router.tsx';
import './index.css';

const messages = {
  en: enMessages as Record<string, string>,
};
const language = (navigator.language.split(/[-_]/)[0] || 'en') as keyof typeof messages; // Language without region code

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntlProvider locale={language} messages={messages[language]}>
      <RouterProvider router={router} />
    </IntlProvider>
  </React.StrictMode>,
);
