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
      // Stop Verify page from polling and creating new connections
      dispatch({ type: 'SET_SUBMIT', payload: 'CREDENTIAL_PENDING' });
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

  useEffect(() => {
    if (!confirmed) return;
    if (!agent || agent.state !== 'running') return;
    if (establishingRef.current) return;
    establishingRef.current = true;

    const establish = async () => {
      try {
        const parsed = await agent.parseOOBInvitation(new URL(window.location.href));
        const callbackId = callback?.split('/').pop();
        const pollingId = callbackId || parsed.id;
        setConnId(pollingId);

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await agent.acceptInvitation(parsed);
          } catch {
            // Accept attempt failed, will retry
          }
          for (let i = 0; i < 10; i++) {
            if (didPeerRef.current) break;
            await new Promise(r => setTimeout(r, 1000));
          }
          if (didPeerRef.current) break;
        }

        setEstablished(true);
        setTimeout(() => setTimeExceed(true), 2400000);
        addAction('connections', {
          oob,
          callback,
          message: 'established',
        });
      } catch (err: any) {
        console.error('Connection establishment failed:', err);
        establishingRef.current = false;
        dispatch({
          type: 'SET_WARN',
          payload: { err: err instanceof Error ? err : new Error(String(err)), section: 'Establish Connection' },
        });
      }
    };
    establish();
  }, [confirmed, agent, listenerActive]);

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
