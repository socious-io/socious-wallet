import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import { isBiometricAvailable, enableBiometrics } from 'src/pages/BiometricUnlock/index.services';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';

function BiometricSetup() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { hash = '' } = useLocation();

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(true);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await isBiometricAvailable();
      setIsAvailable(available);
    } catch (err) {
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleEnableBiometrics = async () => {
    if (!isAvailable) return;

    setIsLoading(true);
    setError('');

    try {
      // Create dummy user data for now - in real app this would come from current user session
      const userData = {
        userId: 'user123',
        token: 'dummy-token',
      };

      await enableBiometrics(userData);

      // Navigate to created page to complete onboarding flow
      navigate(`/created${hash}`, { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Failed to enable biometric unlock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to created page without enabling biometrics
    navigate(`/created${hash}`, { replace: true });
  };

  if (isCheckingAvailability) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card containerClassName={styles['card__container']} contentClassName="gap-4 h-100">
          <div className={styles['card__content']}>
            <Icon name="spinner" className={styles['spinner']} />
            <p>Checking biometric availability...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card containerClassName={styles['card__container']} contentClassName="gap-4 h-100">
          <div className={styles['card__header']}>
            <Icon name="info" className={styles['info-icon']} />
            <h2>Biometric Setup</h2>
          </div>

          <div className={styles['card__content']}>
            <div className={styles['info-message']}>
              <p>Biometric authentication is not available on this device.</p>
              <p className={styles['info-subtitle']}>You can continue using your passcode to unlock your wallet.</p>
            </div>

            <button className={styles['continue-button']} onClick={handleSkip}>
              Continue
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName={styles['card__container']} contentClassName="gap-4 h-100">
        <div className={styles['card__header']}>
          <h2>Secure Your Wallet</h2>
        </div>

        <div className={styles['card__content']}>
          <div className={styles['setup-section']}>
            <p className={styles['instruction']}>
              Enable biometric unlock to access your wallet quickly and securely with your fingerprint or Face ID.
            </p>

            {error && (
              <div className={styles['error-message']}>
                <Icon name="alert-triangle" className={styles['error-icon']} />
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className={styles['button-section']}>
            <button className={styles['enable-button']} onClick={handleEnableBiometrics} disabled={isLoading}>
              {isLoading ? 'Enabling...' : 'Enable Biometric Unlock'}
            </button>

            <button className={styles['skip-button']} onClick={handleSkip} disabled={isLoading}>
              Skip for Now
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BiometricSetup;
