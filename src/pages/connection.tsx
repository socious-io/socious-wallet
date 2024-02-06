import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmModal from 'src/components/confirm';
import { useAgent } from 'src/services/agent';

function Connection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oob = searchParams.get('_oob');
  const { agent } = useAgent();

  if (!oob) return <Navigate to="/" />;

  const handleConfirm = async () => {
    const parsed = await agent.parseOOBInvitation(new URL(window.location.href));
    await agent.acceptInvitation(parsed);
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
