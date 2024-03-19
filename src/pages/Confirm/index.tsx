import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import ConfirmModal from 'src/components/ConfirmModal';
import Card from 'src/components/Card';
import useConfirm from './index.services';
import styles from './index.module.scss';

function Confirm() {
  const navigate = useNavigate();
  const { handleMnemonicValue, onConfirm, disabledConfirm, errorMessage, closeError } = useConfirm();

  return (
    <>
      <Form onSubmit={onConfirm} className="h-100 d-flex align-items-center justify-content-center">
        <Card
          containerClassName={styles['card__container']}
          contentClassName="h-100 flex-row"
          buttons={[
            {
              children: 'Confirm',
              variant: 'primary',
              type: 'submit',
              disabled: disabledConfirm,
              className: 'fw-bold w-100 py-2',
            },
            {
              children: 'Back',
              variant: 'inherit',
              type: 'button',
              onClick: () => navigate('/register'),
              className: 'fw-bold w-100 py-2',
            },
          ]}
        >
          <div className={styles['card__form']}>
            <div className="w-100 d-flex flex-column gap-2 align-items-center">
              <h4 className="fw-bold">Verify Recovery Phrase</h4>
              <span className={styles['card__text']}>Confirm your Secret Recovery Phrase</span>
              <Form.Group className="my-3 my-md-5 w-100" controlId="recovery">
                <Form.Control
                  as="textarea"
                  placeholder="Secret Recovery Phrase"
                  rows={6}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleMnemonicValue(e.target.value)}
                  onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
                    handleMnemonicValue(e.clipboardData.getData('text'))
                  }
                />
              </Form.Group>
            </div>
          </div>
        </Card>
      </Form>
      <ConfirmModal
        open={!!errorMessage}
        header="Opps wrong!"
        headerClassName="text-danger"
        onClose={closeError}
        buttons={[
          { children: 'Understood', variant: 'secondery', onClick: closeError, className: 'flex-grow-1 border-solid' },
        ]}
      >
        <div className={styles['title']}>
          <span className={styles['subtitle']}>{errorMessage}</span>
        </div>
      </ConfirmModal>
    </>
  );
}

export default Confirm;
