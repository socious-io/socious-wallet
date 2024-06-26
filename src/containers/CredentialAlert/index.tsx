import React from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import Icon from 'src/components/Icon';
import { CredentialAlertProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const CredentialAlert: React.FC<CredentialAlertProps> = ({ variant, iconName, title, subtitle, links = [] }) => {
  //P.S: not handled 'primary' | 'secondary' | 'success' | 'info' | 'dark' | 'light' link text
  return (
    <Alert variant={variant} className={styles['alert']}>
      <Icon name={iconName} className={styles['alert__icon']} />
      <div className="d-flex flex-column">
        <span className="fw-bold">{title}</span>
        <p className="mt-1 mb-2">{subtitle}</p>
        <div className="d-flex gap-2">
          {links.length &&
            links.map(link => (
              <Link key={link.to} to={link.to} className={cn(styles['alert__link'], styles[`alert__link--${variant}`])}>
                {link.label}
              </Link>
            ))}
        </div>
      </div>
    </Alert>
  );
};

export default CredentialAlert;
