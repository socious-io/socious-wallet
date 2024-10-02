import { Navigate } from 'react-router-dom';
import Card from 'src/components/Card';
import logo from 'src/assets/images/logo.svg';
import { useIntro } from './index.services';
import styles from './index.module.scss';

function Intro() {
  const { translate, navigate, did, passcode, onCreateWallet } = useIntro();

  if (!did) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card
          buttons={[
            {
              children: translate('intro-create-button'),
              variant: 'primary',
              className: 'fw-semibold w-100 py-2',
              onClick: onCreateWallet,
            },
            {
              children: translate('intro-restore-button'),
              variant: 'light',
              className: 'fw-semibold w-100 py-2',
              onClick: () => navigate('/import'),
            },
          ]}
        >
          <div className="mb-3">
            <img src={logo} width={56} height={56} alt="Socious" className={styles['logo']} />
          </div>
          <h4 className={styles['title']}>{translate('intro-welcome')}</h4>
          <div className={styles['subtitle']}>
            {translate('intro-title')}
            <span>{translate('intro-subtitle')}</span>
          </div>
        </Card>
      </div>
    );
  }
  return <Navigate to={passcode ? '/' : '/setup-pass'} />;
}

export default Intro;
