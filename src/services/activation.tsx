import React, { useEffect } from 'react';
import { useAppContext } from 'src/store/context';

export const Activation: React.FC = () => {
  const { state } = useAppContext();
  const { verification } = state || {};

  useEffect(() => {
    const oob = localStorage.getItem('oob');
    const callback = localStorage.getItem('callback');

    if (verification && oob) {
      localStorage.removeItem('oob');
      localStorage.removeItem('callback');
      window.location.assign(`/connect?_oob=${oob}&callback=${callback}`);
    }
  }, [verification]);

  return <></>;
};
