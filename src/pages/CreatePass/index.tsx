import Card from 'src/components/Card';
import NumPad from 'src/components/NumPad';
import { useCreatePass } from './index.services';
import styles from './index.module.scss';

function CreatePass() {
  const {
    navigate,
    translate,
    handlePasscode,
    handleRetypePass,
    isFirstStep,
    setIsFirstStep,
    errorMessage,
    setErrorMessage,
  } = useCreatePass();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <div className={styles['container']}>
        <div className={styles['header']}>
          <h4 className={styles['header__title']}>
            {isFirstStep ? translate('create-pass-title') : translate('create-pass-retype-title')}
          </h4>
          <div className="d-flex flex-column gap-1">
            <span className={styles['header__subtitle']}>
              {isFirstStep ? translate('create-pass-subtitle') : translate('create-pass-retype-subtitle')}
            </span>
            {errorMessage && <span className={styles['header--error']}>{errorMessage}</span>}
          </div>
        </div>
        {isFirstStep ? (
          <NumPad key="create" onFilled={handlePasscode} onBack={() => navigate('/setup-pass')} />
        ) : (
          <NumPad
            key="re-type"
            onFilled={handleRetypePass}
            onRemove={() => setErrorMessage('')}
            onBack={() => setIsFirstStep(true)}
          />
        )}
      </div>
    </div>
  );
}

export default CreatePass;
