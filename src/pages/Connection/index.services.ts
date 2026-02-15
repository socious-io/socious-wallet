import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'src/services/http';
import { useAppContext } from 'src/store/context';
import { config } from 'src/config';
import { addAction } from 'src/services/datadog';

const CONN_PEER_SUCCESS_STATUS = 'ConnectionResponseSent';

const useConnection = () => {
  const { state, dispatch } = useAppContext();
  const { agent, verification, listenerActive } = state || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oob = searchParams.get('_oob');
  const callback = searchParams.get('callback');
  const verifyConnection = callback?.includes('verify/claims');

  const [openModal, setOpenModal] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [established, setEstablished] = useState(false);
  const [timeExceed, setTimeExceed] = useState(false);
  const [connId, setConnId] = useState('');
  const [didPeer, setDidPeer] = useState(false);
  const establishingRef = useRef(false);
  const didPeerRef = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    didPeerRef.current = didPeer;
  }, [didPeer]);

  useEffect(() => {
    if (timeExceed) {
      dispatch({
        type: 'SET_WARN',
        payload: {
          err: new Error('Establishing connection timeout please try with different QR'),
          section: 'Establish Connection',
        },
      });
      addAction('connections', {
        oob,
        callback,
        message: 'timeout',
      });
      navigate('/');
    }
  }, [timeExceed]);

  useEffect(() => {
    if (established && didPeer) {
      if (callback)
        axios
          .get(callback, { params: { accept: true } })
          .then(r => console.warn(`callback successfully with status ${r.status}`))
          .catch(err => console.error(err));
      navigate('/');
      dispatch({ type: 'SET_LIST_PROCESSING', payload: true });
      addAction('connections', {
        oob,
        callback,
        message: 'didpeer',
      });
    }
  }, [established, didPeer]);

  useEffect(() => {
    if (verification === null && oob && !verifyConnection) {
      localStorage.setItem('oob', oob);
      localStorage.setItem('callback', callback);
      navigate('/intro');
      addAction('connections', {
        oob,
        callback,
        message: 'not-verification-callback',
      });
    }
  }, [verification, oob]);

  useEffect(() => {
    if (connId) {
      const checkStatus = async () => {
        try {
          const { data } = await axios.get(`${config.BACKUP_AGENT}/connections/${connId}?t=${new Date().getTime()}`);
          setDidPeer(data.state === CONN_PEER_SUCCESS_STATUS);
        } catch {
          // Connection status check failed, will retry on next interval
        }
      };
      const intervalId = setInterval(checkStatus, 3000);
      checkStatus(); // immediate first check
      return () => clearInterval(intervalId);
    }
  }, [connId]);

  // Start connection polling as soon as we have a callback ID, even before agent is ready
  useEffect(() => {
    if (!confirmed) return;
    const callbackId = callback?.split('/').pop();
    if (callbackId && !connId) {
      setConnId(callbackId);
    }
  }, [confirmed, callback, connId]);

  useEffect(() => {
    if (!confirmed) return;
    if (establishingRef.current) return;

    const diag = (step: string, data?: any) => {
      try {
        axios.post(`${config.BACKUP_AGENT}/diag`, { step, data }).catch(() => undefined);
      } catch {}
    };

    const establish = async () => {
      // Wait for agent to become available (up to 30 seconds)
      let currentAgent = agent;
      diag('establish-start', { hasAgent: !!currentAgent, agentState: currentAgent?.state });
      if (!currentAgent || currentAgent.state !== 'running') {
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 1000));
          currentAgent = stateRef.current?.agent;
          if (currentAgent && currentAgent.state === 'running') break;
        }
        diag('agent-wait-done', { hasAgent: !!currentAgent, agentState: currentAgent?.state });
      }

      if (!currentAgent || currentAgent.state !== 'running') {
        diag('agent-not-ready');
        dispatch({
          type: 'SET_WARN',
          payload: {
            err: new Error('Agent not ready. Please restart the app and try again.'),
            section: 'Establish Connection',
          },
        });
        return;
      }

      try {
        const url = new URL(window.location.href);
        diag('parse-oob', { href: url.href.substring(0, 200), hasOob: !!url.searchParams.get('_oob') });
        const parsed = await currentAgent.parseOOBInvitation(url);
        diag('parse-oob-ok', { type: parsed?.type, id: parsed?.id });

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            diag('accept-attempt', { attempt });
            await currentAgent.acceptInvitation(parsed);
            diag('accept-ok', { attempt });
          } catch (acceptErr: any) {
            diag('accept-error', {
              attempt,
              error: acceptErr?.message || String(acceptErr),
              stack: acceptErr?.stack?.substring(0, 300),
            });
          }
          for (let i = 0; i < 10; i++) {
            if (didPeerRef.current) break;
            await new Promise(r => setTimeout(r, 1000));
          }
          if (didPeerRef.current) {
            diag('didpeer-found', { attempt });
            break;
          }
        }

        setEstablished(true);
        setTimeout(() => setTimeExceed(true), 2400000);
        addAction('connections', {
          oob,
          callback,
          message: 'established',
        });
      } catch (err: any) {
        diag('establish-error', { error: err?.message || String(err) });
        console.error('Connection establishment failed:', err);
        establishingRef.current = false;
        dispatch({
          type: 'SET_WARN',
          payload: { err: err instanceof Error ? err : new Error(String(err)), section: 'Establish Connection' },
        });
      }
    };

    establishingRef.current = true;
    establish();
  }, [confirmed]);

  const handleConfirm = async () => {
    setConfirmed(true);
    setOpenModal(false);
    addAction('connections', {
      oob,
      callback,
      message: 'confirmed',
    });
  };

  const handleCancel = () => {
    if (callback) {
      axios
        .get(callback, { params: { reject: true } })
        .then(r => console.warn(`callback successfully with status ${r.status}`))
        .catch(err => console.error(err));
    }
    navigate('/');
    addAction('connections', {
      oob,
      callback,
      message: 'canceled',
    });
  };

  return {
    oob,
    openModal,
    handleConfirm,
    handleCancel,
    verification,
    verifyConnection,
  };
};

export default useConnection;
