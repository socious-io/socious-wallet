import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, ListGroup } from 'react-bootstrap';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import CredentialCard from 'src/containers/CredentialCard';
// import sampleAvatar from 'src/assets/images/sample-avatar.png';
import credentialsPlaceholder from 'src/assets/images/empty-credentials.svg';
import kycAvatar from 'src/assets/images/kyc-avatar.png';
import { useAppContext } from 'src/store';
import { beautifyText, formatDate } from 'src/utilities';
import styles from './index.module.scss';
import cn from 'classnames';

function Credentials() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { credentials, verification, submitted } = state || {};
  const { id } = useParams();

  const renderPartialDataCard = (claim, id: string | number, isClickable?: boolean) => {
    const isKyc = claim?.type === 'verification';
    const props = isKyc
      ? {
          // title: `${claim['first_name']} ${claim['last_name']}`,
          // subtitle: claim['country'],
          title: 'Veriff',
          subtitle: 'KYC',
          date: claim['verified_at'],
          avatar: kycAvatar,
        }
      : {
          title: claim['company_name'],
          // subtitle: claim['job_category'],
          subtitle: 'Work Certificate',
          date: claim['start_date'],
          // avatar: sampleAvatar,
        };

    return (
      <CredentialCard key={id} {...props} verified onCardClick={() => isClickable && navigate(`/credentials/${id}`)} />
    );
  };

  const renderAlert = (iconName: string, title: string, subtitle: string, link?: { to: string; text: string }) => {
    return (
      <Alert variant="warning" className={styles['alert']}>
        <Icon name={iconName} className={styles['alert__icon']} />
        <div className="d-flex flex-column">
          <span className="fw-bold">{title}</span>
          <p className="mt-1 mb-2">{subtitle}</p>
          {link?.to && (
            <Link to={link.to} className={styles['alert__link']}>
              {link.text}
            </Link>
          )}
        </div>
      </Alert>
    );
  };

  const renderCredentialsList = () => {
    return (
      <>
        {submitted &&
          !verification &&
          renderAlert(
            'alert-submit',
            'Verification request submitted',
            "Your identity is being reviewed. We'll notify you as soon as it's complete.",
          )}
        {!verification &&
          renderAlert(
            'alert',
            'Verfication Required',
            'To receive verifiable credentials you need to verify your identity.',
            {
              to: '/verify',
              text: 'Verify now',
            },
          )}
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
        type: 'Know Your Customer (KYC)',
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
                        <span className="fw-normal text-secondary">{formatClaimField(claim, field)}</span>
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
          <Icon name="bell" />
        </div>
        <>
          {id ? renderCredentialDetails() : renderCredentialsList()}
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
        </>
      </Card>
    </div>
  );
}

export default Credentials;
