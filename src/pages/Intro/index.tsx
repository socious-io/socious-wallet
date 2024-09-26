import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import logo from 'src/assets/images/logo.svg';
import styles from './index.module.scss';
import Card from 'src/components/Card';

function Intro() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAppContext();
  if (state.did) return <Navigate to="/" />;

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        buttons={[
          {
            children: translate('intro-create-button'),
            variant: 'primary',
            className: 'fw-bold w-100 py-2',
            onClick: () => navigate('/register'),
          },
          {
            children: translate('intro-restore-button'),
            variant: 'inherit',
            className: `fw-bold w-100 py-2 ${styles['card__secondary_btn']}`,
            onClick: () => navigate('/import'),
          },
        ]}
      >
        <div className="mb-3">
          <img src={logo} width={48} height={48} alt="Socious" />
        </div>
        <h4 className="fw-bold">{translate('intro-welcome')}</h4>
        <div className={styles['card__subtitle']}>
          <div className={styles['card__text']}>{translate('intro-title')} </div>
          <div className={styles['card__text']}>{translate('intro-subtitle')}</div>
        </div>
      </Card>
    </div>
  );
}

export default Intro;
