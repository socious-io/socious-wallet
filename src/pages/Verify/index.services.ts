import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this package types has issue so we ignore error
import axios from 'src/services/http';
import { config } from 'src/config';

const FLAG_KEY = 'submitted_kyc';

//FIXME: create api folder for each axios request
const startKYC = async (did: string, session?: string) => {
  const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
  try {
    const response = await axios.post(`${config.BACKUP_AGENT}/verify/start`, { did, session }, { headers });
    localStorage.setItem('session', response.data.session);
    localStorage.setItem(FLAG_KEY, 'APPROVED');
    return response.data;
  } catch (err) {
    alert(err);
  }
};

const useVerify = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, credentials, verification } = state || {};
  const [submitted, setSubmitted] = useState(localStorage.getItem(FLAG_KEY) === 'APPROVED');

  const onStartVerification = async () => {
    if (submitted) return;
    setSubmitted(true);
    const { url } = await startKYC(did.methodId, localStorage.getItem('session'));
    window.location.replace(url);
  };

  useEffect(() => {
    if (credentials.length > 0 && verification) {
      navigate('/credentials');
    }
  }, [credentials, verification]);

  useEffect(() => {
    if (did && submitted && verification === null) {
      const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };

      const checkStatus = () => {
        axios
          .get(`${config.BACKUP_AGENT}/verify/${did.methodId}/status`, { headers })
          .then(r => {
            switch (r.data.verification?.status.toLowerCase()) {
              case 'not started':
                onStartVerification();
                break;
              case 'declined':
                localStorage.setItem(FLAG_KEY, 'DECLINED');
                setSubmitted(false);
                localStorage.removeItem('session');
                dispatch({ type: 'SET_SUBMIT', payload: 'DECLINED' });
                break;
              case 'expired':
                localStorage.setItem(FLAG_KEY, 'EXPIRED');
                setSubmitted(false);
                dispatch({ type: 'SET_SUBMIT', payload: 'EXPIRED' });
                break;
              case 'abandoned':
                localStorage.setItem(FLAG_KEY, 'ABANDONED');
                setSubmitted(false);
                dispatch({ type: 'SET_SUBMIT', payload: 'ABANDONED' });
                break;
              case 'approved': {
                const url = new URL(r.data.connection.url);
                // need to clear messages before redirect
                dispatch({ type: 'SET_NEW_MESSAGE', payload: [] });
                navigate(`${url.pathname}${url.search}`);
                break;
              }
            }
          })
          .catch(err => {
            const sessionID = localStorage.getItem('session');
            console.log(err);
            if (err?.response?.status === 400 && sessionID) {
              startKYC(did.methodId, sessionID);
            }
          });
      };

      const intervalId = setInterval(checkStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [did, submitted, navigate, dispatch, verification]);

  return { translate, submitted, verification, onStartVerification };
};

export default useVerify;
