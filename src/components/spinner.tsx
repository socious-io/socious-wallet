import React from 'react';
import { Spinner, Modal } from 'react-bootstrap';

interface CenteredSpinnerProps {
  show: boolean;
}

const CenteredSpinner: React.FC<CenteredSpinnerProps> = ({ show }) => {
  return (
    <Modal
      show={show}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="background-transparent"
    >
      <Modal.Body className="text-center">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Modal.Body>
    </Modal>
  );
};

export default CenteredSpinner;
