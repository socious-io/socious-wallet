import React, { useEffect } from 'react';
import { useAppContext } from 'src/store';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';
import { config } from 'src/config';

const AppUrlListener: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { device } = state || {};

  useEffect(() => {
    if (device?.platform === 'web' && !config.DEBUG) navigate('/download');
  }, [device]);

  useEffect(() => {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      try {
        const url = new URL(event.url);
        navigate(`${url.pathname}${url.search}`);
      } catch (error) {
        console.log('No url present');
      }
    });
  }, []);

  return null;
};

export default AppUrlListener;
