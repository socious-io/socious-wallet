import { Alert } from 'react-bootstrap';
import Card from 'src/components/Card';
// import Icon from 'src/components/Icon';
import verifyImage from 'src/assets/images/verify-image.svg';
import useVerify from './index.services';
import styles from './index.module.scss';
import NavigationBar from 'src/containers/NavigationBar';

function Verify() {
  const { submitted, verification } = useVerify();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}>
          Verification
          {/* <Icon name="bell" /> */}
        </div>
        <div className={styles['card__content']}>
          <div className={styles['card__information']}>
            <h4 className="fw-bold">Verify your identity</h4>
            <span className="text-secondary text-center">
              Socious Wallet is dedicated to complying with KYC, AML, and GDPR regulations to ensure privacy and
              security. We do not store any personal data.
            </span>
            <img src={verifyImage} width={354} height={186} alt="Verify Id Card" />
          </div>
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
        <NavigationBar />
      </Card>
    </div>
  );
}

export default Verify;
