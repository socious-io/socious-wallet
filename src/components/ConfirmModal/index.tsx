import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ConfirmModalProps } from './index.types';
import cn from 'classnames';

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  closeButton = true,
  header,
  headerIcon,
  children,
  buttons = [],
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
}) => {
  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton={closeButton} style={{ border: 'none' }} className={headerClassName}>
        {headerIcon}
        <Modal.Title style={{ fontSize: 'inherit' }}>{header}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={contentClassName}>{children}</Modal.Body>
      {!!buttons?.length && (
        <Modal.Footer className={cn('w-100', footerClassName)} style={{ border: 'none' }}>
          {buttons.map((button, index) => (
            <Button key={index} {...button} />
          ))}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ConfirmModal;
