import React from 'react';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import { CreatedCardProps } from './index.types';
import styles from './index.module.scss';

const CreatedCard: React.FC<CreatedCardProps> = ({
  title,
  subtitle,
  iconName = '',
  buttons = [],
  contentClassName = '',
}) => {
  return (
    <Card
      buttons={buttons}
      containerClassName={styles['card__container']}
      contentClassName={`pt-5 text-center ${contentClassName}`}
    >
      <div className="d-flex flex-column align-items-center gap-2">
        {iconName && <Icon name={iconName} className={styles['card__icon']} />}
        <h4 className={styles['card__title']}>{title}</h4>
        <span className={styles['card__subtitle']}>{subtitle}</span>
      </div>
    </Card>
  );
};

export default CreatedCard;
