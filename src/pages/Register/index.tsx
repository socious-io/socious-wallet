import { Navigate } from 'react-router-dom';
import Card from 'src/components/Card';
import Loading from 'src/components/Loading';
import MnemonicsDisplay from 'src/containers/MnemonicsDisplay';
import useRegister from './index.services';
import styles from './index.module.scss';

function Register() {
  const { did, mnemonics, onSave } = useRegister();

  if (did) return <Navigate to="/" />;
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        containerClassName={styles['card__container']}
        buttons={[
          {
            children: 'OK, I saved it somewhere',
            variant: 'primary',
            className: 'fw-bold w-100 py-2',
            onClick: onSave,
          },
        ]}
      >
        <h4 className="fw-bold">Secret Recovery Phrase</h4>
        <span className={styles['card__text']}>
          This is the only way you will be able to recover your wallet. Please store it somewhere safe.
        </span>
        {mnemonics?.length ? <MnemonicsDisplay mnemonics={mnemonics} /> : <Loading show={true} />}
      </Card>
    </div>
  );
}

export default Register;
