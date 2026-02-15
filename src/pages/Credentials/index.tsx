import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListGroup, Button } from 'react-bootstrap'; // Added Button import
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import CredentialCard from 'src/containers/CredentialCard';
import CredentialAlert from 'src/containers/CredentialAlert';
import credentialsPlaceholder from 'src/assets/images/empty-credentials.svg';
import sociousLogo from 'src/assets/images/socious-logo.png';
import kycAvatar from 'src/assets/images/kyc-avatar.png';
import { useAppContext } from 'src/store/context';
import { beautifyText, formatDate, truncateFromMiddle } from 'src/utilities';
import styles from './index.module.scss';
import cn from 'classnames';
import NavigationBar from 'src/containers/NavigationBar';

function Credentials() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { credentials, verification, submitted, listProcessing } = state || {};
  const { id } = useParams();

  // Auto-redirect to /verify when verification is in progress so polling resumes
  // Skip redirect for CREDENTIAL_PENDING — credential is on its way, just wait
  if (
    !verification &&
    submitted !== 'CREDENTIAL_PENDING' &&
    (submitted === 'INPROGRESS' || submitted === 'INREVIEW' || submitted === 'APPROVED')
  ) {
    return <Navigate to="/verify" replace />;
  }

  const isKyc = type => type === 'verification';

  const generateNonKycTypeText = claim => {
    const subtitle = {
      ['experience']: translate('credential-experience'),
      ['education']: translate('credential-education'),
    };
    const subtitleKey = claim?.type || ('job_category' in claim ? 'experience' : 'education');
    return subtitle[subtitleKey];
  };

  const renderPartialDataCard = (claim, id: string | number, isClickable?: boolean, isDetail?: boolean) => {
    const cardsData = (() => {
      switch (claim?.type) {
        case 'verification':
          return {
            title: 'Didit',
            subtitle: 'KYC',
            date: claim['issued_date'] || claim['verified_at'],
            avatar: kycAvatar,
          };
        case 'impact_point_badges':
          return Array.isArray(claim.badges)
            ? claim.badges.map(c => ({
                title: 'Socious',
                subtitle: beautifyText(c.social_cause_category),
                date: claim['issued_date'],
                avatar: sociousLogo,
              }))
            : [];
        default:
          return {
            title: claim['company_name'] || claim['institute_name'],
            subtitle: claim.type || 'UNKNOWN',
            date: claim['issued_date'] || claim['start_date'],
          };
      }
    })();

    if (claim?.type === 'impact_point_badges') {
      return cardsData.map((prop, index) => (
        <CredentialCard
          key={`${id}-${index}`}
          {...prop}
          verified={true}
          className={isDetail && styles['card--detail']}
        />
      ));
    }
    return (
      <CredentialCard
        key={id}
        {...cardsData}
        verified={isKyc(claim?.type)}
        onCardClick={() => isClickable && navigate(`/credentials/${id}`)}
        className={isDetail && styles['card--detail']}
      />
    );
  };

  const renderCredentialsList = () => {
    let props = null;
    switch (submitted) {
      case 'APPROVED':
        props = {
          variant: 'warning',
          iconName: 'alert-submit',
          title: translate('credential-alert.approved-title'),
          subtitle: translate('credential-alert.approved-subtitle'),
          links: [
            {
              to: '/verify',
              label: translate('credential-alert.approved-link'),
            },
          ],
        };
        break;
      case 'INPROGRESS':
      case 'INREVIEW':
        props = {
          variant: 'warning',
          iconName: 'alert-submit',
          title: translate('credential-alert.approved-title'),
          subtitle: translate('credential-alert.approved-subtitle'),
          links: [
            {
              to: '/verify',
              label: translate('credential-alert.approved-link'),
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
          title: translate('credential-alert.declined-title'),
          subtitle: translate('credential-alert.declined-subtitle'),
          links: [
            {
              to: '/verify',
              label: translate('credential-alert.declined-link1'),
            },
            {
              to: 'mailto:support@socious.io',
              label: translate('credential-alert.declined-link2'),
            },
          ],
        };
        break;
      default:
        props = {
          variant: 'warning',
          iconName: 'alert-warning',
          title: translate('credential-alert.default-title'),
          subtitle: translate('credential-alert.default-subtitle'),
          links: [
            {
              to: '/verify',
              label: translate('credential-alert.default-link'),
            },
          ],
        };
        break;
    }
    return (
      <>
        {!verification && !listProcessing && <CredentialAlert {...props} />}
        {listProcessing && (
          <CredentialAlert
            variant="warning"
            iconName="alert-warning"
            title={translate('credential-alert.processing-title')}
            subtitle={translate('credential-alert.processing-subtitle')}
          />
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
              <h5 className="fw-bold">{translate('credential-title')}</h5>
              <span className="text-secondary">{translate('credential-subtitle')}</span>
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
        type: isKyc(claim?.type) ? `${translate('credential-kyc')} (KYC)` : generateNonKycTypeText(claim),
        verified_at: formatDate(claim[field]),
        start_date: formatDate(claim[field]),
        end_date: formatDate(claim[field]),
        date_of_birth: formatDate(claim[field]),
      };
      return fieldFormatters[field] || claim[field];
    };

    return (
      <div className={cn(styles['card__content'], 'm-0 p-0 d-flex flex-column gap-4')}>
        <div className={styles['card__back']} onClick={() => navigate('/credentials')}>
          <Icon name="arrow-left" />
          {translate('credential-back-button')}
        </div>
        {filteredCredential.claims.map((claim, index) => renderPartialDataCard(claim, index, false, true))}
        <ListGroup className="font-size-md px-3">
          <>
            <div className="d-flex flex-column py-3 fw-bold border-bottom border-solid">
              ID
              <span className="fw-normal text-secondary">
                {truncateFromMiddle(filteredCredential.id.toString(), 10, 5)}
              </span>
            </div>
            {filteredCredential.claims.map(claim =>
              Object.keys(claim)
                .filter(field => field !== 'id')
                .sort((a, b) => {
                  const order = [
                    'last_name',
                    'first_name',
                    'gender',
                    'date_of_birth',
                    'country',
                    'id_number',
                    'document_type',
                    'document_number',
                    'issued_date',
                    'type',
                  ];
                  const ai = order.indexOf(a);
                  const bi = order.indexOf(b);
                  return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
                })
                .map(
                  (field, i) =>
                    claim[field] && (
                      <div key={`field${i}`} className={styles['card__item']}>
                        {beautifyText(field)}
                        <span className="fw-normal text-secondary text-break text-truncate">
                          {beautifyText(field) === 'First name'
                            ? state.firstname
                            : beautifyText(field) === 'Last name'
                              ? state.lastname
                              : formatClaimField(claim, field)}
                        </span>
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
        <div className={styles['card__header']}>{translate('credential-card-header')}</div>
        <>
          {id ? renderCredentialDetails() : renderCredentialsList()}
          <NavigationBar />
        </>
      </Card>
    </div>
  );
}

export default Credentials;
