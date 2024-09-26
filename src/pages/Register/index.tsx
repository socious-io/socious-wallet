import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from 'src/components/Card';
import Loading from 'src/components/Loading';
import MnemonicsDisplay from 'src/containers/MnemonicsDisplay';
import useRegister from './index.services';
import styles from './index.module.scss';

function Register() {
  const { t: translate } = useTranslation();
  const { did, mnemonics, onSave } = useRegister();

  if (did) return <Navigate to="/" />;
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        containerClassName={styles['card__container']}
        buttons={[
          {
            children: translate('register-save-button'),
            variant: 'primary',
            className: 'fw-bold w-100 py-2',
            onClick: onSave,
          },
        ]}
      >
        <h4 className="fw-bold">{translate('register-title')}</h4>
        <span className={styles['card__text']}>{translate('register-subtitle')}</span>
        {mnemonics?.length ? <MnemonicsDisplay mnemonics={mnemonics} /> : <Loading show={true} />}
      </Card>
    </div>
  );
}

export default Register;
