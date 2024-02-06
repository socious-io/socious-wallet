import React from 'react';
import { Button, Modal } from 'react-bootstrap';

// Define props for ConfirmModal
interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmName?: string;
  cancelName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  title,
  message,
  confirmName,
  cancelName,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {cancelName || 'Cancel'}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          {confirmName || 'Confirm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
