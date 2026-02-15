import { Alert } from 'react-bootstrap';
import Card from 'src/components/Card';
import { Button } from 'react-bootstrap';
// import Icon from 'src/components/Icon';
import verifyImage from 'src/assets/images/verify-image.svg';
import useVerify from './index.services';
import styles from './index.module.scss';
import NavigationBar from 'src/containers/NavigationBar';

function Verify() {
  const { translate, onStartVerification, submitStatus } = useVerify();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}>
          {translate('verify-card-header')}
          {/* <Icon name="bell" /> */}
        </div>
        <div className={styles['card__content']}>
          <div className={styles['card__information']}>
            <h4 className="fw-bold">{translate('verify-title')}</h4>
            <span className="text-secondary text-center">{translate('verify-subtitle')}</span>
            <img src={verifyImage} width={354} height={186} alt="Verify Id Card" />
          </div>
          {submitStatus !== 'INREVIEW' && submitStatus !== 'APPROVED' && submitStatus !== 'INPROGRESS' && (
            <Button variant="primary" type="submit" className="fw-semibold w-100 py-2" onClick={onStartVerification}>
              {translate('verify-veriff-button')}
            </Button>
          )}

          {submitStatus === 'INPROGRESS' && (
            <Alert variant="info" className="w-100">
              {translate('verify-inprogress')}
            </Alert>
          )}
          {submitStatus === 'INREVIEW' && (
            <Alert variant="primary" className="w-100">
              {translate('verify-submitted')}
            </Alert>
          )}
          {submitStatus === 'APPROVED' && <Alert className="w-100">{translate('verify-verified')}</Alert>}
        </div>
        <NavigationBar />
      </Card>
    </div>
  );
}

export default Verify;
