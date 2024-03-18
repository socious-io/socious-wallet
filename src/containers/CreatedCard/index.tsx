import React from 'react';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import { CreatedCardProps } from './index.types';
import styles from './index.module.scss';

const CreatedCard: React.FC<CreatedCardProps> = ({ title, subtitle, iconName = '', buttons = [] }) => {
  return (
    <Card buttons={buttons} containerClassName={styles['card__container']}>
      <div className="d-flex flex-column align-items-center gap-2">
        {iconName && <Icon name={iconName} className={styles['card__icon']} />}
        <h4>{title}</h4>
        <span className="text-secondary">{subtitle}</span>
      </div>
    </Card>
  );
};

export default CreatedCard;
