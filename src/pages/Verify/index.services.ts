import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { getRunningAgent } from 'src/services/agent';

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
  const approvedRef = useRef(false);
  const burstPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentPollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const sessionId = localStorage.getItem('session') || '';
    const response = await axios.get(
      `${config.BACKUP_AGENT}/verify/${did?.methodId}/status?t=${new Date().getTime()}&session=${sessionId}`,
      {
        headers,
      },
    );
    return response.data;
  }, [did?.methodId]);

  const handleStatusResponse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (response: any) => {
      const status = response.verification?.status?.toLowerCase();
      if (!status) return;
      switch (status) {
        case 'not started':
          localStorage.setItem(FLAG_KEY, 'NOT_STARTED');
          dispatch({ type: 'SET_SUBMIT', payload: 'NOT_STARTED' });
          break;
        case 'declined':
          localStorage.setItem(FLAG_KEY, 'DECLINED');
          localStorage.removeItem('session');
          dispatch({ type: 'SET_SUBMIT', payload: 'DECLINED' });
          Browser?.close().catch((e: unknown) => console.warn('Browser.close:', e));
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
          Browser.close().catch((e: unknown) => console.warn('Browser.close:', e));
          break;
        case 'approved': {
          if (approvedRef.current) break;
          if (!response.connection?.url) break;
          approvedRef.current = true;
          dispatch({ type: 'SET_NEW_MESSAGE', payload: [] });

          if (state.device.platform !== 'web') {
            Browser?.close().catch((e: unknown) => console.warn('Browser.close:', e));
          }

          const url = new URL(response.connection.url);
          const connectPath = `${url.pathname}${url.search}`;

          // Wait for agent to be running before navigating to /connect
          const startTime = Date.now();
          const pollForAgent = () => {
            const agent = getRunningAgent();
            if (agent) {
              console.log('[Verify] Agent ready, navigating to', connectPath);
              navigate(connectPath);
            } else if (Date.now() - startTime > 120000) {
              console.warn('[Verify] Agent not ready after 120s, navigating anyway');
              navigate(connectPath);
            } else {
              console.log('[Verify] Waiting for agent...', Math.round((Date.now() - startTime) / 1000), 's');
              agentPollRef.current = setTimeout(pollForAgent, 2000);
            }
          };
          pollForAgent();
          break;
        }
        default:
          console.error('Unknown status:', status);
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

  // Start burst polling: check every 2s for 30s to quickly detect status changes
  const startBurstPolling = useCallback(() => {
    if (burstPollRef.current) clearInterval(burstPollRef.current);
    let count = 0;
    burstPollRef.current = setInterval(() => {
      count++;
      checkStatus();
      if (count >= 15) {
        // 15 * 2s = 30s, stop burst and fall back to normal 5s polling
        if (burstPollRef.current) clearInterval(burstPollRef.current);
        burstPollRef.current = null;
      }
    }, 2000);
  }, [checkStatus]);

  // Listen for custom URL scheme (sociouswallet://) from DIDIT callback redirect.
  // This fires when DIDIT completes and redirects through wallet-api to our URL scheme.
  useEffect(() => {
    const urlListener = App.addListener('appUrlOpen', data => {
      if (data.url?.startsWith('sociouswallet://')) {
        Browser.close().catch((e: unknown) => console.warn('Browser.close:', e));
        checkStatus();
        startBurstPolling();
      }
    });
    return () => {
      urlListener.then(l => l.remove());
      if (burstPollRef.current) clearInterval(burstPollRef.current);
      if (agentPollRef.current) clearTimeout(agentPollRef.current);
    };
  }, [checkStatus, startBurstPolling]);

  // Listen for browser close (iOS: SFSafariViewController dismissed)
  // and immediately check status since timers are suspended while browser is open
  useEffect(() => {
    const listener = Browser.addListener('browserFinished', () => {
      checkStatus();
      startBurstPolling();
    });

    // Also check on visibility change (app returning to foreground)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
        startBurstPolling();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      listener.then(l => l.remove());
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [checkStatus, startBurstPolling]);

  return { translate, verification, onStartVerification, submitStatus: state.submitted };
};

export default useVerify;
