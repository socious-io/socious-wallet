import React from 'react';
import { Button } from 'react-bootstrap';
import { CardProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const Card: React.FC<CardProps> = ({ children, buttons = [], containerClassName = '', contentClassName = '' }) => {
  return (
    <div className={cn(styles['card'], containerClassName)}>
      <div className={cn(styles['card__content'], contentClassName)}>{children}</div>
      {!!buttons?.length && (
        <div className={styles['card__buttons']}>
          {buttons.map((button, index) => (
            <Button key={index} {...button} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Card;
