import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';

const AppUrlListener: React.FC<unknown> = () => {
  const navigate = useNavigate();
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
