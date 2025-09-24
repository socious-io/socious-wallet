import { useState, useEffect } from 'react';
import Card from 'src/components/Card';
import NumPad from 'src/components/NumPad';
import { isBiometricAvailable, unlockWithBiometrics } from 'src/pages/BiometricUnlock/index.services';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

function UnlockPage() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPincode, setShowPincode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  useEffect(() => {
    const autoAttemptBiometricUnlock = async () => {
      if (biometricAvailable && biometricEnabled && !showPincode) {
        setTimeout(() => {
          handleBiometricUnlock();
        }, 500);
      }
    };

    autoAttemptBiometricUnlock();
  }, [biometricAvailable, biometricEnabled, showPincode]);

  const checkBiometricStatus = async () => {
    try {
      const available = await isBiometricAvailable();
      const enabled = localStorage.getItem('biometricUnlock') === 'enabled';

      setBiometricAvailable(available);
      setBiometricEnabled(enabled);

      if (!available || !enabled) {
        setShowPincode(true);
      }
    } catch (err) {
      setShowPincode(true);
    }
  };

  const handleBiometricUnlock = async () => {
    setIsLoading(true);
    setError('');

    try {
      const userData = await unlockWithBiometrics();

      if (userData) {
        // Successfully unlocked with biometrics
        sessionStorage.setItem('isAuthenticated', 'true');
        navigate('/credentials', { replace: true });
      } else {
        setError('Biometric unlock failed. Please try again or use your passcode.');
      }
    } catch (err) {
      setError('Biometric unlock failed. Please try again or use your passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPassword = (enteredPass: string) => {
    const passcode = localStorage.getItem('passcode');
    if (enteredPass === passcode) {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/credentials', { replace: true });
    } else {
      setErrorMessage(translate('wallet-entry-error'));
    }
  };

  const handleUsePincode = () => {
    setShowPincode(true);
    setError('');
  };

  if (showPincode) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <div className={styles['container']}>
          <div className={styles['header']}>
            <h4 className={styles['header__title']}>{translate('wallet-entry-retype-title')}</h4>
            <div className="d-flex flex-column gap-1">
              <span className={styles['header__subtitle']}>{translate('wallet-entry-subtitle')}</span>
            </div>
            {errorMessage && <span className={styles['header--error']}>{errorMessage}</span>}
          </div>

          <NumPad key="unlock-pincode" onFilled={checkPassword} onRemove={() => setErrorMessage('')} />

          {biometricAvailable && biometricEnabled && (
            <div className={styles['biometric-option']}>
              <button className={styles['biometric-button']} onClick={() => setShowPincode(false)}>
                Use Biometric Unlock
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName={styles['card__container']} contentClassName="gap-4 h-100">
        <div className={styles['card__header']}>
          <h2>Unlock Your Wallet</h2>
        </div>

        <div className={styles['card__content']}>
          {error && (
            <div className={styles['error-message']}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles['unlock-section']}>
            <p className={styles['instruction']}>Use your fingerprint or Face ID to quickly unlock your wallet</p>

            <button className={styles['unlock-button']} onClick={handleBiometricUnlock} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Unlock with Biometrics'}
            </button>

            <button className={styles['pincode-button']} onClick={handleUsePincode}>
              Use Passcode Instead
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UnlockPage;
