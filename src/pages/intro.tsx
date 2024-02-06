import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();

  return (
    <>
      <Button onClick={() => navigate('/register')}>Register</Button>
      <Button onClick={() => navigate('/recover')}>Recover Wallet</Button>
    </>
  );
}

export default Intro;
