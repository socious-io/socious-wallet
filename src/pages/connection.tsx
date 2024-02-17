import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmModal from 'src/components/confirm';
import Spinner from 'src/components/spinner';
import { useAppState } from 'src/store';

function Connection() {
  const { agent, message } = useAppState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oob = searchParams.get('_oob');
  const callback = searchParams.get('callback');

  const [show, setShow] = useState(true);
  const [established, setEstablished] = useState(false);

  useEffect(() => {
    if (established && message.length > 0) {
      if (callback)
        axios
          .get(callback, { params: { accept: true } })
          .then((r) => console.log(`callback successfully with status ${r.status}`))
          .catch((err) => console.log(err));
      navigate('/');
    }
  }, [message, established, callback, navigate]);

  if (!oob) return <Navigate to="/" />;

  const handleConfirm = async () => {
    if (!agent) {
      alert('wait more please');
      return;
    }
    setShow(false);
    const parsed = await agent.parseOOBInvitation(new URL(window.location.href));
    await agent.acceptInvitation(parsed);
    setEstablished(true);
  };

  const handleCancel = () => {
    if (callback) {
      axios
        .get(callback, { params: { reject: true } })
        .then((r) => console.log(`callback successfully with status ${r.status}`))
        .catch((err) => console.log(err));
    }
    navigate('/');
  };

  return (
    <>
      <ConfirmModal
        show={show}
        title="invitation"
        message="Do you accept connection ?"
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
      <Spinner show={!show} message="Please wait connection to be establish" />
    </>
  );
}

export default Connection;
