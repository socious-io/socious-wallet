import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ConfirmModalProps } from './index.types';

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  header,
  children,
  buttons = [],
  headerClassName = '',
  contentClassName = '',
}) => {
  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton style={{ border: 'none' }}>
        <Modal.Title className={headerClassName}>{header}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={contentClassName}>{children}</Modal.Body>
      {!!buttons?.length && (
        <Modal.Footer className="w-100" style={{ border: 'none' }}>
          {buttons.map((button, index) => (
            <Button key={index} {...button} />
          ))}
        </Modal.Footer>
      )}
    </Modal>
  );
};
export default ConfirmModal;