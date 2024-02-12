import axios from 'axios';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmModal from 'src/components/confirm';
import { useAppState } from 'src/store';

function Connection() {
  const appState = useAppState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oob = searchParams.get('_oob');
  const callback = searchParams.get('callback');

  if (!oob) return <Navigate to="/" />;

  const handleConfirm = async () => {
    if (!appState.agent) {
      alert('wait more please');
      return;
    }
    const parsed = await appState.agent.parseOOBInvitation(new URL(window.location.href));
    await appState.agent.acceptInvitation(parsed);
    if (callback) {
      axios
        .get(callback, { params: { accept: true } })
        .then((r) => console.log(`callback successfully with status ${r.status}`))
        .catch((err) => console.log(err));
    }
    navigate('/');
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
    <ConfirmModal
      show={true}
      title="invitation"
      message="Do you accept connection ?"
      onClose={handleCancel}
      onConfirm={handleConfirm}
    />
  );
}

export default Connection;
