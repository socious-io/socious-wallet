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
      const slug = event.url.split('.io').pop();
      if (slug && slug !== '/') {
        navigate(slug);
      } else {
        navigate('/intro');
      }
    });
  }, []);

  return null;
};

export default AppUrlListener;
