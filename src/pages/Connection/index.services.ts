import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'src/services/http';
import { useAppContext } from 'src/store/context';
import { config } from 'src/config';
import { addAction } from 'src/services/datadog';
import { getRunningAgent } from 'src/services/agent';

const CONN_PEER_SUCCESS_STATUS = 'ConnectionResponseSent';

const diag = (step: string, data?: any) => {
  try {
    axios.post(`${config.BACKUP_AGENT}/diag`, { step, data }).catch(() => undefined);
  } catch {}
};

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
  const renderCountRef = useRef(0);
  // Keep a ref to the latest agent from context so the poll can access it
  // without agent being in the effect's dependency array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentRef = useRef<any>(agent);

  renderCountRef.current++;
  diag('conn-render', {
    render: renderCountRef.current,
    confirmed,
    hasAgent: !!agent,
    agentState: agent?.state,
    listenerActive,
    establishing: establishingRef.current,
    hasOob: !!oob,
    hasCallback: !!callback,
  });

  useEffect(() => {
    didPeerRef.current = didPeer;
  }, [didPeer]);

  useEffect(() => {
    agentRef.current = agent;
  }, [agent]);

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
      diag('conn-complete', { established, didPeer, callback });
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

  // Extract establish logic so it can be called with any agent reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doEstablish = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (agentToUse: any) => {
      try {
        diag('conn-parse-oob', { href: window.location.href.substring(0, 200) });
        const parsed = await agentToUse.parseOOBInvitation(new URL(window.location.href));
        diag('conn-parse-oob-ok', { type: parsed?.type, id: parsed?.id });
        const callbackId = callback?.split('/').pop();
        const pollingId = callbackId || parsed.id;
        setConnId(pollingId);
        diag('conn-polling-started', { pollingId });

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            diag('conn-accept-attempt', { attempt });
            await agentToUse.acceptInvitation(parsed);
            diag('conn-accept-ok', { attempt });
          } catch (acceptErr: any) {
            diag('conn-accept-error', {
              attempt,
              error: acceptErr?.message || String(acceptErr),
            });
          }
          for (let i = 0; i < 10; i++) {
            if (didPeerRef.current) break;
            await new Promise(r => setTimeout(r, 1000));
          }
          if (didPeerRef.current) {
            diag('conn-didpeer-found', { attempt });
            break;
          }
        }

        setEstablished(true);
        diag('conn-established');
        setTimeout(() => setTimeExceed(true), 2400000);
        addAction('connections', {
          oob,
          callback,
          message: 'established',
        });
      } catch (err: any) {
        diag('conn-establish-error', { error: err?.message || String(err) });
        console.error('Connection establishment failed:', err);
        establishingRef.current = false;
        dispatch({
          type: 'SET_WARN',
          payload: { err: err instanceof Error ? err : new Error(String(err)), section: 'Establish Connection' },
        });
      }
    },
    [callback, oob, dispatch],
  );

  // IMPORTANT: Do NOT include agent or listenerActive in deps.
  // On iOS, SET_AGENT context dispatch kills the poll via effect cleanup
  // but never re-fires the effect (context propagation fails in WKWebView).
  // Instead, we use agentRef + getRunningAgent() to find the agent independently.
  useEffect(() => {
    const contextAgent = agentRef.current;
    diag('conn-effect-fire', {
      confirmed,
      hasAgent: !!contextAgent,
      agentState: contextAgent?.state,
      establishing: establishingRef.current,
    });
    if (!confirmed) return;
    if (establishingRef.current) {
      diag('conn-effect-skip-already-establishing');
      return;
    }

    // Try context agent (via ref) first, then module-level reference
    const availableAgent = contextAgent && contextAgent.state === 'running' ? contextAgent : getRunningAgent();

    if (availableAgent) {
      establishingRef.current = true;
      diag('conn-effect-starting-establish', {
        source: contextAgent === availableAgent ? 'context' : 'module',
      });
      doEstablish(availableAgent);
      return;
    }

    // Agent not ready yet — poll agentRef + getRunningAgent() every 2s (up to 120s)
    // This poll is immune to React context changes because agent is NOT in deps
    diag('conn-waiting-for-agent');
    const pollId = setInterval(() => {
      if (establishingRef.current) {
        clearInterval(pollId);
        return;
      }
      const fromRef = agentRef.current;
      const polled = fromRef && fromRef.state === 'running' ? fromRef : getRunningAgent();
      diag('conn-agent-poll', { found: !!polled, fromRef: !!fromRef, fromModule: !!getRunningAgent() });
      if (polled) {
        clearInterval(pollId);
        establishingRef.current = true;
        diag('conn-agent-found-via-poll', { state: polled.state });
        doEstablish(polled);
      }
    }, 2000);

    const timeoutId = setTimeout(() => {
      clearInterval(pollId);
      if (!establishingRef.current) {
        diag('conn-agent-poll-timeout');
      }
    }, 120000);

    return () => {
      clearInterval(pollId);
      clearTimeout(timeoutId);
    };
  }, [confirmed, doEstablish]);

  const handleConfirm = async () => {
    diag('conn-confirm', { hasAgent: !!agent, agentState: agent?.state });
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
