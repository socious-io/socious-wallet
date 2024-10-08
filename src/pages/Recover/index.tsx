import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import { Form } from 'react-bootstrap';
import ConfirmModal from 'src/components/ConfirmModal';
import Card from 'src/components/Card';
import useRecover from './index.services';
import styles from './index.module.scss';

function Recover() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { handleMnemonicValue, onConfirm, disabledConfirm, errorMessage, closeError } = useRecover();
  const { state } = useAppContext();

  if (state.did) return <Navigate to="/" />;
  return (
    <>
      <Form onSubmit={onConfirm} className="h-100 d-flex align-items-center justify-content-center">
        <Card
          containerClassName={styles['card__container']}
          contentClassName="h-100 flex-row"
          buttons={[
            {
              children: translate('recover-import-button'),
              variant: 'primary',
              type: 'submit',
              disabled: disabledConfirm,
              className: 'fw-bold w-100 py-2',
            },
            {
              children: translate('recover-back-button'),
              variant: 'inherit',
              type: 'button',
              onClick: () => navigate('/intro'),
              className: 'fw-bold w-100 py-2',
            },
          ]}
        >
          <div className={styles['card__form']}>
            <div className="d-flex flex-column gap-2 align-items-center">
              <h4 className="fw-bold">{translate('recover-title')}</h4>
              <span className={styles['card__text']}>{translate('recover-subtitle')}</span>
              <Form.Group className="my-3 my-md-5 w-100" controlId="recovery">
                <Form.Control
                  as="textarea"
                  placeholder={translate('recover-title')}
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
        open={errorMessage !== undefined}
        header={translate('recover-confirm.header')}
        onClose={closeError}
        buttons={[
          {
            children: translate('recover-confirm.button'),
            variant: 'secondary',
            onClick: closeError,
            className: 'flex-grow-1 border-solid',
          },
        ]}
      >
        <div className={styles['title']}>
          <span className={styles['subtitle']}>{errorMessage}</span>
        </div>
      </ConfirmModal>
    </>
  );
}

export default Recover;
