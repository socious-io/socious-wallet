import { Navigate } from 'react-router-dom';
import Card from 'src/components/Card';
import { useSetupPass } from './index.services';
import styles from './index.module.scss';

function SetupPass() {
  const { translate, navigate, did } = useSetupPass();

  if (did) return <Navigate to="/" />;
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        contentClassName="justify-content-start pt-5 text-center"
        buttons={[
          {
            children: translate('setup-pass-title'),
            variant: 'primary',
            className: 'fw-semibold w-100 py-2',
            onClick: () => navigate('/create-pass'),
          },
          {
            children: translate('setup-pass-back'),
            variant: 'light',
            className: 'fw-semibold w-100 py-2',
            onClick: () => navigate('/intro'),
          },
        ]}
      >
        <h4 className={styles['title']}>{translate('setup-pass-title')}</h4>
        <span className={styles['subtitle']}>{translate('setup-pass-subtitle')}</span>
      </Card>
    </div>
  );
}

export default SetupPass;
