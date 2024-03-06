import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import useVerify from './index.services';
import styles from './index.module.scss';

function Verify() {
  const navigate = useNavigate();
  const { submitted, verification } = useVerify();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName={styles['card__container']}>
        <div className={styles['card__header']}>
          Verification
          <Icon name="bell" />
        </div>
        <div className={styles['card__content']}>
          {!submitted && <div id="veriff-root"></div>}
          {submitted && !verification && (
            <Alert variant="primary" className="w-100">
              Your verfication request has been submitted.
            </Alert>
          )}
          {verification && (
            <Alert variant="warning" className="w-100">
              Your identity has been verified.
            </Alert>
          )}
        </div>
        <div className={styles['card__footer']}>
          <div className={styles['card__nav']}>
            <Icon name="shield-tick" onClick={() => navigate('/')} />
            Credentials
          </div>
          <div className={styles['card__nav']}>
            <Icon name="settings" />
            Settings
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Verify;
