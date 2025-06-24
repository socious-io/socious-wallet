import { useWalletEntry } from './index.services';
import NumPad from 'src/components/NumPad';

import styles from './index.module.scss';

function WalletEntry() {
  const { translate, errorMessage, setErrorMessage, checkPassword } = useWalletEntry();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <div className={styles['container']}>
        <div className={styles['header']}>
          <h4 className={styles['header__title']}>{translate('wallet-entry-retype-title')}</h4>
          <div className="d-flex flex-column gap-1">
            <span className={styles['header__subtitle']}>{translate('wallet-entry-subtitle')} </span>
          </div>
          {errorMessage && <span className={styles['header--error']}>{errorMessage}</span>}
        </div>

        <NumPad
          key="re-type"
          onFilled={checkPassword}
          onRemove={() => setErrorMessage('')}
          onBack={() => console.log(true)}
        />
      </div>
    </div>
  );
}

export default WalletEntry;
