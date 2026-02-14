import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import { Browser } from '@capacitor/browser';

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
    localStorage.setItem(FLAG_KEY, 'INPROGRESS');
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const useVerify = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, credentials, verification } = state || {};

  const onStartVerification = async () => {
    // if in review or approved return
    if (state.submitted === 'INREVIEW' || state.submitted === 'APPROVED') return;

    const { url } = await startKYC(did.methodId, localStorage.getItem('session'));
    if (state.device.platform === 'web') window.location.replace(url);
    else Browser.open({ url });
  };

  useEffect(() => {
    if (credentials.length > 0 && verification) {
      navigate('/credentials');
    }
  }, [credentials, verification]);

  const getVerificationStatus = useCallback(async () => {
    const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
    const response = await axios.get(`${config.BACKUP_AGENT}/verify/${did?.methodId}/status?t=${new Date().getTime()}`, {
      headers,
    });
    return response.data;
  }, [did?.methodId]);

  useEffect(() => {
    if ((did && verification === null) || state.submitted === 'INREVIEW' || state.submitted === 'INPROGRESS' || state.submitted === 'APPROVED') {
      const checkStatus = async () => {
        try {
          const response = await getVerificationStatus();
          switch (response.verification?.status.toLowerCase()) {
            case 'not started':
              localStorage.setItem(FLAG_KEY, 'NOT_STARTED');
              dispatch({ type: 'SET_SUBMIT', payload: 'NOT_STARTED' });
              break;
            case 'declined':
              localStorage.setItem(FLAG_KEY, 'DECLINED');
              localStorage.removeItem('session');
              dispatch({ type: 'SET_SUBMIT', payload: 'DECLINED' });
              Browser?.close();
              break;
            case 'in progress':
              dispatch({ type: 'SET_SUBMIT', payload: 'INPROGRESS' });
              break;
            case 'expired':
              localStorage.setItem(FLAG_KEY, 'EXPIRED');
              dispatch({ type: 'SET_SUBMIT', payload: 'EXPIRED' });
              break;
            case 'abandoned':
              localStorage.setItem(FLAG_KEY, 'ABANDONED');
              dispatch({ type: 'SET_SUBMIT', payload: 'ABANDONED' });
              break;
            case 'in review':
              dispatch({ type: 'SET_SUBMIT', payload: 'INREVIEW' });
              Browser.close();
              break;
            case 'approved': {
              // Need to clear messages before redirect
              dispatch({ type: 'SET_NEW_MESSAGE', payload: [] });
              // For Web navigate to the new url
              const url = new URL(response.connection.url);
              navigate(`${url.pathname}${url.search}`);

              //For Mobile if state changes to approved and init status is not approved close the browser
              if (state.device.platform !== 'web') Browser?.close();

              break;
            }
            default:
              console.error('Unknown status:');
          }
        } catch (err) {
          const sessionID = localStorage.getItem('session');
          console.error(err);
          if (err?.response?.status === 400 && sessionID) {
            startKYC(did.methodId, sessionID);
          }
        }
      };

      const intervalId = setInterval(checkStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [did, verification, dispatch, navigate, getVerificationStatus]);

  return { translate, verification, onStartVerification, submitStatus: state.submitted };
};

export default useVerify;
