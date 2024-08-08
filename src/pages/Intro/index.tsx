import { useNavigate, Navigate } from 'react-router-dom';
import { useAppContext } from 'src/store';
import logo from 'src/assets/images/logo.svg';
import styles from './index.module.scss';
import Card from 'src/components/Card';

function Intro() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  if (state.did) return <Navigate to="/" />;

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        buttons={[
          {
            children: 'Create a wallet',
            variant: 'primary',
            className: 'fw-bold w-100 py-2',
            onClick: () => navigate('/register'),
          },
          {
            children: 'I already have a wallet',
            variant: 'inherit',
            className: `fw-bold w-100 py-2 ${styles['card__secondary_btn']}`,
            onClick: () => navigate('/import'),
          },
        ]}
      >
        <div className="mb-3">
          <img src={logo} width={48} height={48} alt="Socious" />
        </div>
        <h4 className="fw-bold">Welcome to Socious Wallet</h4>
        <div className={styles['card__subtitle']}>
          <div className={styles['card__text']}>Reclaim your digital life. </div>
          <div className={styles['card__text']}>Store and manage your identity securely.</div>
        </div>
      </Card>
    </div>
  );
}

export default Intro;
