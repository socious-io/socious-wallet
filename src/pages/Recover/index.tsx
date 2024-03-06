import React from 'react';
import { Form } from 'react-bootstrap';
import Card from 'src/components/Card';
import useRecover from './index.services';
import styles from './index.module.scss';

function Recover() {
  const { handleMnemonicValue, onConfirm, disabledConfirm } = useRecover();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        containerClassName={styles['card__container']}
        buttons={[
          {
            children: 'Confirm',
            variant: 'primary',
            type: 'submit',
            disabled: disabledConfirm,
            className: 'fw-bold w-100 py-2',
          },
        ]}
      >
        <Form onSubmit={onConfirm} className={styles['card__form']}>
          <h4 className="fw-bold">Secret Recovery Phrase</h4>
          <span className={styles['card__text']}>Confirm your Secret Recovery Phrase.</span>
          <Form.Group className="w-100" controlId="recovery">
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
        </Form>
      </Card>
    </div>
  );
}

export default Recover;
