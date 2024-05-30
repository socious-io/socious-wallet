import { Navigate } from 'react-router-dom';
import ConfirmModal from 'src/components/ConfirmModal';
import Loading from 'src/components/Loading';
import Card from 'src/components/Card';
// import Icon from 'src/components/Icon';
import useConnection from './index.services';
import styles from './index.module.scss';
import NavigationBar from 'src/containers/NavigationBar';

function Connection() {
  const { oob, openModal, handleConfirm, handleCancel, verification, verifyConnection } = useConnection();

  if (!oob) return <Navigate to="/" />;
  if (!verification && !verifyConnection) return <></>;
  return (
    <>
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
          <div className={styles['card__header']}>
            Connection
            {/* <Icon name="bell" /> */}
          </div>
          <div className={styles['card__content']}>
            <Loading show={!openModal} message="Please wait for the connection to be established!" />
          </div>
          <NavigationBar />
        </Card>
      </div>
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
    </>
  );
}

export default Connection;
