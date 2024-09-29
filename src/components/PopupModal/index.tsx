import React from 'react';
import { Modal } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import { PopupModalProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const PopupModal: React.FC<PopupModalProps> = ({
  open,
  onClose,
  header,
  children,
  transition = 'bottom',
  headerClassName = '',
  contentClassName = '',
}) => {
  return (
    <Modal
      show={open}
      onHide={onClose}
      dialogClassName={cn(styles['dialog'], styles[`slide--${transition}`])}
      contentClassName={styles[`content--${transition}`]}
      centered={!isMobile}
      backdrop={true}
    >
      <Modal.Header className={cn(styles['header'], headerClassName)}>
        <Modal.Title style={{ fontSize: 'inherit' }}>{header}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={cn(styles['body'], contentClassName)}>{children}</Modal.Body>
    </Modal>
  );
};

export default PopupModal;
