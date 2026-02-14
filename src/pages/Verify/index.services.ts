import { useEffect, useCallback, useRef } from 'react';
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
  const checkingRef = useRef(false);

  const onStartVerification = async () => {
    // if in review or approved return
    if (state.submitted === 'INREVIEW' || state.submitted === 'APPROVED') return;

    const { url } = await startKYC(did.methodId, localStorage.getItem('session'));
    dispatch({ type: 'SET_SUBMIT', payload: 'INPROGRESS' });
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
    const response = await axios.get(
      `${config.BACKUP_AGENT}/verify/${did?.methodId}/status?t=${new Date().getTime()}`,
      {
        headers,
      },
    );
    return response.data;
  }, [did?.methodId]);

  const handleStatusResponse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (response: any) => {
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
    },
    [dispatch, navigate, state.device.platform],
  );

  const checkStatus = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const response = await getVerificationStatus();
      handleStatusResponse(response);
    } catch (err) {
      const sessionID = localStorage.getItem('session');
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.response?.status === 400 && sessionID) {
        startKYC(did.methodId, sessionID);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [getVerificationStatus, handleStatusResponse, did?.methodId]);

  // Polling interval for status checks
  useEffect(() => {
    if (
      (did && verification === null) ||
      state.submitted === 'INREVIEW' ||
      state.submitted === 'INPROGRESS' ||
      state.submitted === 'APPROVED'
    ) {
      const intervalId = setInterval(checkStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [did, verification, state.submitted, checkStatus]);

  // Listen for browser close (iOS: SFSafariViewController dismissed)
  // and immediately check status since timers are suspended while browser is open
  useEffect(() => {
    const listener = Browser.addListener('browserFinished', () => {
      // eslint-disable-next-line no-console
      console.log('Browser closed, checking verification status');
      checkStatus();
    });

    // Also check on visibility change (app returning to foreground)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // eslint-disable-next-line no-console
        console.log('App visible, checking verification status');
        checkStatus();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      listener.then(l => l.remove());
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [checkStatus]);

  return { translate, verification, onStartVerification, submitStatus: state.submitted };
};

export default useVerify;
