import React, { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';

const AppUrlListener: React.FC = () => {
  const navigate = useNavigate();

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
