import { Navigate } from 'react-router-dom';
import ConfirmModal from 'src/components/ConfirmModal';
import Loading from 'src/components/Loading';
import useConnection from './index.services';
import styles from './index.module.scss';

function Connection() {
  const { oob, openModal, handleConfirm, handleCancel, verification, verifyConnection } = useConnection();

  if (!oob) return <Navigate to="/" />;
  if (!verification && !verifyConnection) return <></>;
  return (
    <>
      <ConfirmModal
        open={openModal}
        header="invitation"
        onClose={handleCancel}
        buttons={[
          { children: 'Cancel', variant: 'inherit', onClick: handleCancel, className: 'flex-grow-1 border-solid' },
          { children: 'Confirm', variant: 'primary', onClick: handleConfirm, className: 'flex-grow-1' },
        ]}
      >
        <div className={styles['title']}>
          Accept credential?
          <span className={styles['subtitle']}>You received a credential!</span>
        </div>
      </ConfirmModal>
      <Loading show={!openModal} message="Please wait for the connection to be established!" />
    </>
  );
}

export default Connection;
