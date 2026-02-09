import { useState, useEffect } from 'react';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import NavigationBar from 'src/containers/NavigationBar';
import { isBiometricAvailable, enableBiometrics, disableBiometrics } from './index.services';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from 'src/store/context';
import styles from './index.module.scss';

interface BiometricUnlockProps {
  onEnableSuccess?: () => void;
  onEnableFailed?: () => void;
}

function BiometricUnlock({ onEnableSuccess, onEnableFailed }: BiometricUnlockProps) {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkBiometricStatus();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await isBiometricAvailable();
      setIsAvailable(available);
      if (!available) {
        setError('Biometric authentication is not available on this device');
      }
    } catch (err) {
      setError('Failed to check biometric availability');
    }
  };

  const checkBiometricStatus = () => {
    const enabled = localStorage.getItem('biometricUnlock') === 'enabled';
    setIsEnabled(enabled);
  };

  const handleEnableBiometrics = async () => {
    if (!isAvailable) return;

    setIsLoading(true);
    setError('');

    try {
      const userData = {
        userId: `${state.firstname} ${state.lastname}`.trim() || 'User',
        token: state.did?.toString() || 'unknown',
      };

      await enableBiometrics(userData);

      setIsEnabled(true);
      setError('');
      onEnableSuccess?.();
    } catch (err) {
      setError((err as Error).message || 'Failed to enable biometric unlock');
      onEnableFailed?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableBiometrics = async () => {
    setIsLoading(true);
    setError('');

    try {
      await disableBiometrics();
      setIsEnabled(false);
      setError('');
      onEnableFailed?.();
    } catch (err) {
      setError((err as Error).message || 'Failed to disable biometric unlock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}>
          <button className={styles['back-button']} onClick={() => navigate('/settings')}>
            <Icon name="chevron-left" />
          </button>
          <h2>{translate('settings-items.biometric-unlock')}</h2>
          <div className={styles['header-spacer']}></div>
        </div>

        <div className={styles['card__content']}>
          {!isAvailable && (
            <div className={styles['error-message']}>
              <p>Biometric authentication is not available</p>
            </div>
          )}

          {error && (
            <div className={styles['error-message']}>
              <p>{error}</p>
            </div>
          )}

          {isAvailable && (
            <div className={styles['unlock-section']}>
              <div className={styles['status-section']}>
                <div className={styles['status-info']}>
                  <h3>Biometric Authentication</h3>
                  <p className={styles['status-text']}>
                    Status:{' '}
                    <span className={isEnabled ? styles['status-enabled'] : styles['status-disabled']}>
                      {isEnabled ? translate('settings-items.enabled') : translate('settings-items.disabled')}
                    </span>
                  </p>
                  <p className={styles['description']}>
                    {isEnabled
                      ? 'You can use your fingerprint or Face ID to unlock your wallet'
                      : 'Enable biometric unlock to secure your wallet with fingerprint or Face ID'}
                  </p>
                </div>
              </div>

              <div className={styles['button-section']}>
                {!isEnabled ? (
                  <button className={styles['unlock-button']} onClick={handleEnableBiometrics} disabled={isLoading}>
                    {isLoading ? 'Enabling...' : 'Enable Biometric Unlock'}
                  </button>
                ) : (
                  <button className={styles['disable-button']} onClick={handleDisableBiometrics} disabled={isLoading}>
                    {isLoading ? 'Disabling...' : 'Disable Biometric Unlock'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <NavigationBar />
      </Card>
    </div>
  );
}

export default BiometricUnlock;
