import React, { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';

const AppUrlListener: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      try {
        // Ignore sociouswallet:// URLs — these are handled by the Verify page listener
        if (event.url?.startsWith('sociouswallet://')) return;
        const url = new URL(event.url);
        navigate(`${url.pathname}${url.search}`);
      } catch (error) {
        console.error('No url present');
      }
    });
  }, []);

  return null;
};

export default AppUrlListener;
