import { useNavigate, useParams } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import CredentialCard from 'src/containers/CredentialCard';
import CredentialAlert from 'src/containers/CredentialAlert';
// import sampleAvatar from 'src/assets/images/sample-avatar.png';
import credentialsPlaceholder from 'src/assets/images/empty-credentials.svg';
import kycAvatar from 'src/assets/images/kyc-avatar.png';
import { useAppContext } from 'src/store';
import { beautifyText, formatDate } from 'src/utilities';
import styles from './index.module.scss';
import cn from 'classnames';
import NavigationBar from 'src/containers/NavigationBar';
import { APP_VERSION } from 'src/config';
import { VerifyStatus } from 'src/store/types';
import { CredentialAlertProps } from 'src/containers/CredentialAlert/index.types';

function Credentials() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { credentials, verification, submitted, device } = state || {};
  const { id } = useParams();
  const isKyc = type => type === 'verification';
  const generateNonKycTypeText = claim => {
    const subtitle = {
      ['experience']: 'Work Certificate',
      ['education']: 'Educational Certificate',
    };
    const subtitleKey = claim?.type || ('job_category' in claim ? 'experience' : 'education');
    return subtitle[subtitleKey];
  };

  const renderPartialDataCard = (claim, id: string | number, isClickable?: boolean) => {
    const props = isKyc(claim?.type)
      ? {
          title: 'Veriff',
          subtitle: 'KYC',
          date: claim['issued_date'] || claim['verified_at'],
          avatar: kycAvatar,
        }
      : {
          title: claim['company_name'] || claim['institute_name'],
          subtitle: generateNonKycTypeText(claim),
          date: claim['issued_date'] || claim['start_date'],
          // avatar: sampleAvatar,
        };

    return (
      <CredentialCard key={id} {...props} verified onCardClick={() => isClickable && navigate(`/credentials/${id}`)} />
    );
  };

  const renderCredentialsList = () => {
    let props = null;
    switch (submitted) {
      case 'APPROVED':
        props = {
          variant: 'warning',
          iconName: 'alert-submit',
          title: 'Verification request submitted',
          subtitle: "Your identity is being reviewed. We'll notify you as soon as it's complete.",
          links: [
            {
              to: '/verify',
              label: 'Check verification',
            },
          ],
        };
        break;
      case 'ABANDONED':
      case 'EXPIRED':
      case 'DECLINED':
        props = {
          variant: 'danger',
          iconName: 'alert-danger',
          title: 'Verification rejected',
          subtitle: 'Your verification request was denied.',
          links: [
            {
              to: '/verify',
              label: 'Verify again',
            },
            {
              to: 'mailto:support@socious.io',
              label: 'Contact us',
            },
          ],
        };
        break;
      default:
        props = {
          variant: 'warning',
          iconName: 'alert-warning',
          title: 'Verification Required',
          subtitle: 'To receive verifiable credentials you need to verify your identity.',
          links: [
            {
              to: '/verify',
              label: 'Verify now',
            },
          ],
        };
        break;
    }

    return (
      <>
        {!verification && <CredentialAlert {...props} />}
        <div className={styles['card__content']}>
          {credentials.length ? (
            <div className="w-100 d-flex flex-column gap-3">
              {credentials.map(credential =>
                credential.claims.map(claim => renderPartialDataCard(claim, credential.id, true)),
              )}
            </div>
          ) : (
            <div className={styles['card__empty']}>
              <img
                src={credentialsPlaceholder}
                height={128}
                width={172}
                alt="no credentials"
                className={styles['card__image']}
              />
              <h5 className="fw-bold">Connect to an organization to receive your first credential</h5>
              <span className="text-secondary">Receive, store and share your digital credentials</span>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderCredentialDetails = () => {
    const filteredCredential = credentials.find(credential => String(credential.id) === id);
    const formatClaimField = (claim, field: string) => {
      const fieldFormatters = {
        type: isKyc(claim?.type) ? 'Know Your Customer (KYC)' : generateNonKycTypeText(claim),
        verified_at: formatDate(claim[field]),
        start_date: formatDate(claim[field]),
        end_date: formatDate(claim[field]),
        date_of_birth: formatDate(claim[field]),
      };
      return fieldFormatters[field] || claim[field];
    };

    return (
      <div className={cn(styles['card__content'], 'd-flex flex-column gap-4')}>
        <div
          className="d-flex align-items-center gap-1 pointer text-secondary fw-bold"
          onClick={() => navigate('/credentials')}
        >
          <Icon name="arrow-left" />
          Back
        </div>
        {filteredCredential.claims.map((claim, index) => renderPartialDataCard(claim, index))}
        <ListGroup className="font-size-md">
          <>
            <div className="d-flex flex-column py-3 fw-bold border-bottom border-solid">
              ID
              <span className="fw-normal text-secondary">{filteredCredential.id}</span>
            </div>
            {filteredCredential.claims.map(claim =>
              Object.keys(claim)
                .filter(field => field !== 'id')
                .map(
                  (field, i) =>
                    claim[field] && (
                      <div key={`field${i}`} className="d-flex flex-column py-3 fw-bold border-bottom border-solid">
                        {beautifyText(field)}
                        <span className="fw-normal text-secondary text-break">{formatClaimField(claim, field)}</span>
                      </div>
                    ),
                ),
            )}
          </>
        </ListGroup>
      </div>
    );
  };

  return (
    <div className={styles['home']}>
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}>
          Credentials
          {/* <Icon name="bell" /> */}
        </div>
        <>
          {id ? renderCredentialDetails() : renderCredentialsList()}
          <NavigationBar />
        </>
      </Card>
    </div>
  );
}

export default Credentials;
