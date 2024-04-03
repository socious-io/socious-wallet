import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from 'src/store';

const useConnection = () => {
  const { state } = useAppContext();
  const { agent, message, verification } = state || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oob = searchParams.get('_oob');
  const callback = searchParams.get('callback');
  const verifyConnection = callback.includes('verify/claims');
  const [openModal, setOpenModal] = useState(true);
  const [established, setEstablished] = useState(false);

  useEffect(() => {
    if (established && message.length > 0) {
      if (callback)
        axios
          .get(callback, { params: { accept: true } })
          .then(r => console.log(`callback successfully with status ${r.status}`))
          .catch(err => console.log(err));
      navigate('/');
    }
  }, [message, established, callback, navigate]);

  useEffect(() => {
    if (verification === null && oob && !verifyConnection) {
      localStorage.setItem('oob', oob);
      localStorage.setItem('callback', callback);
      navigate('/intro');
    }
  }, [verification, oob, callback]);

  const handleConfirm = async () => {
    if (!agent) {
      alert('wait more please');
      return;
    }
    setOpenModal(false);
    const parsed = await agent.parseOOBInvitation(new URL(window.location.href));
    await agent.acceptInvitation(parsed);
    setEstablished(true);
  };

  const handleCancel = () => {
    if (callback) {
      axios
        .get(callback, { params: { reject: true } })
        .then(r => console.log(`callback successfully with status ${r.status}`))
        .catch(err => console.log(err));
    }
    navigate('/');
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
