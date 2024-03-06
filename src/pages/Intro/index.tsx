import { useNavigate } from 'react-router-dom';
import logo from 'src/assets/images/logo.svg';
import styles from './index.module.scss';
import Card from 'src/components/Card';

function Intro() {
  const navigate = useNavigate();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        buttons={[
          {
            children: 'Create a new wallet',
            variant: 'primary',
            className: 'fw-bold w-100 py-2',
            onClick: () => navigate('/register'),
          },
          {
            children: 'I already have a wallet',
            variant: 'inherit',
            className: 'fw-bold w-100 py-2',
            onClick: () => navigate('/recover'),
          },
        ]}
      >
        <div className="mb-3">
          <img src={logo} width={48} height={48} alt="Socious" />
        </div>
        <h4 className="fw-bold">Welcome to Socious Wallet</h4>
        <span className={styles['card__text']}>To get started, create a new wallet or import from a seed phrase</span>
      </Card>
    </div>
  );
}

export default Intro;
