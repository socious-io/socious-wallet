import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { SelectIdentityModalProps } from './index.types';
import cn from 'classnames';
import { useAppContext } from 'src/store/context';
import { useTranslation } from 'react-i18next';
import { FeaturedIcon } from '../FeaturedIcon';
import styles from './index.module.scss';
import { beautifyText, formatDate } from 'src/utilities';

const SelectCredentialModal: React.FC<SelectIdentityModalProps> = ({ open, onClose, onSuccess }) => {
  const { t: translate } = useTranslation();
  const { dispatch } = useAppContext();
  const { credentials } = useAppContext().state || {};
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);

  const handleCredentialChange = (credentialId: string) => {
    setSelectedCredentialId(credentialId);
  };

  const renderOptions = () =>
    credentials.map(credential => (
      <Form.Check
        key={credential.id}
        type="radio"
        id={`credential-${credential.id}`}
        label={credential.claims[0]?.document_type || beautifyText(credential.claims[0]?.type)}
        name="credentialSelection"
        checked={selectedCredentialId === credential.id}
        onChange={() => handleCredentialChange(credential.id)}
        className="mb-2"
      />
    ));

  const handleConfirm = () => {
    if (selectedCredentialId) {
      const selectedCredential = credentials.find(c => c.id === selectedCredentialId);
      if (selectedCredential) {
        dispatch({
          type: 'SET_SELECTED_CREDENTIAL',
          payload: selectedCredential,
        });
      }
    }
    onSuccess();
  };

  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Header closeButton={true} className={styles['modal-header']}>
        <FeaturedIcon iconName={'shield-tick'} />
      </Modal.Header>
      <Modal.Body>
        <div className={styles['share-title']}>{translate('selectCredentialModal.shareTitle')}</div>
        <p className={styles['choose-credential-text']}>{translate('selectCredentialModal.chooseCredentialText')}</p>
        <Form>{renderOptions()}</Form>
      </Modal.Body>
      <Modal.Footer className={cn(styles['modal-footer'], 'w-100')}>
        <div className="d-flex flex-column flex-md-row gap-2 w-100">
          <Button variant="primary" className="w-100" onClick={handleConfirm} disabled={!selectedCredentialId}>
            {translate('selectCredentialModal.confirmButton')}
          </Button>
          <Button variant="light" onClick={onClose} className="w-100">
            {translate('selectCredentialModal.cancelButton')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectCredentialModal;
