import { useEffect, useState } from 'react';
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
          .then(r => console.log(`callback successfully with status ${r.status}`))
          .catch(err => console.log(err));
      navigate('/');
      localStorage.setItem('listProcessing', 'true');
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
        const { data } = await axios.get(`${config.BACKUP_AGENT}/connections/${connId}?t=${new Date().getTime()}`);
        setDidPeer(data.state === CONN_PEER_SUCCESS_STATUS);
      };
      const intervalId = setInterval(checkStatus, 3000);
      return () => clearInterval(intervalId);
    }
  }, [connId]);

  useEffect(() => {
    if (confirmed && agent?.state === 'running') {
      const establish = async () => {
        const parsed = await agent.parseOOBInvitation(new URL(window.location.href));
        setConnId(parsed.id);
        await agent.acceptInvitation(parsed);
        setEstablished(true);
        setTimeout(() => setTimeExceed(true), 2400000);
        addAction('connections', {
          oob,
          callback,
          message: 'established',
        });
      };
      establish();
    }
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
        .then(r => console.log(`callback successfully with status ${r.status}`))
        .catch(err => console.log(err));
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
