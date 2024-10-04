import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from 'react-bootstrap';
import Icon from 'src/components/Icon';
import { beautifyText, formatDate } from 'src/utilities';
import { CredentialCardProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const CredentialCard: React.FC<CredentialCardProps> = ({
  title,
  subtitle,
  date,
  verified,
  avatar = '',
  onCardClick,
  className = '',
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className={cn(styles['container'], className)} onClick={onCardClick}>
      <div className="w-100 d-flex flex-column align-items-start gap-1">
        <div className="w-100 d-flex justify-content-between">
          <h6 className="fw-bold">{beautifyText(title)}</h6>
          <Icon name="three-dots" />
        </div>
        <span className="font-size-md text-secondary">{subtitle}</span>
      </div>

      <div className="w-100 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3 text-secondary font-size-sm">
          {date && (
            <>
              {translate('credential-card.issued')} {formatDate(date)}
            </>
          )}
          <Badge
            className={cn(
              'd-flex align-items-center gap-1 fw-bold font-size-sm',
              verified ? 'badge-primary' : 'badge-error',
            )}
          >
            <Icon name={verified ? 'check-verified' : 'invalid'} />
            {verified ? translate('credential-card.verified') : translate('credential-card.invalid')}
          </Badge>
        </div>
        {avatar && <img src={avatar} alt="credential-avatar" width={40} height={40} />}
      </div>
    </div>
  );
};

export default CredentialCard;
