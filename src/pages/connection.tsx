import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmModal from 'src/components/confirm';
import { useAppState } from 'src/store';

function Connection() {
  const appState = useAppState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oob = searchParams.get('_oob');

  if (!oob) return <Navigate to="/" />;

  const handleConfirm = async () => {
    if (!appState.agent) {
      alert('wait more please');
      return;
    }
    const parsed = await appState.agent.parseOOBInvitation(new URL(window.location.href));
    await appState.agent.acceptInvitation(parsed);
    navigate('/');
  };

  return (
    <ConfirmModal
      show={true}
      title="invitation"
      message="Do you accept connection ?"
      onClose={() => navigate('/')}
      onConfirm={handleConfirm}
    />
  );
}

export default Connection;
