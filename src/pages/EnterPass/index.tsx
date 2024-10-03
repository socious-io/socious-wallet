import NumPad from 'src/components/NumPad';
import { useEnterPass } from './index.services';
import styles from './index.module.scss';

function EnterPass() {
  const { translate, navigate, handlePasscode } = useEnterPass();

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <h4 className={styles['header__title']}>{translate('enter-pass-title')}</h4>
        <div className="d-flex flex-column gap-1">
          <span className={styles['header__subtitle']}>{translate('enter-pass-subtitle')}</span>
        </div>
      </div>
      <NumPad onFilled={handlePasscode} onBack={() => navigate('/import')} />
    </div>
  );
}

export default EnterPass;
