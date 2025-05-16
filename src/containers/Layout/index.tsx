import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import Loading from 'src/components/Loading';
import AppUrlListener from 'src/containers/AppUrlListener';
import ConfirmModal from 'src/components/ConfirmModal';
import { config } from 'src/config';
import styles from './index.module.scss';

const Layout = () => {
  const { state } = useAppContext();
  const { t: translate } = useTranslation();
  const { warn, error, didLoading, verifiedVC } = state || {};
  const [warnShow, setWarnShow] = useState(false);
  const [errorShow, setErrorShow] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleCancel = () => setOpenModal(false);

  useEffect(() => {
    if (warn) setWarnShow(true);
    setInterval(() => setWarnShow(false), 3000);
  }, [warn]);

  useEffect(() => {
    if (error) setErrorShow(true);
    setInterval(() => setErrorShow(false), 8000);
  }, [error]);

  useEffect(() => {
    if (verifiedVC?.type) setOpenModal(true);
    setInterval(() => setErrorShow(false), 8000);
  }, [verifiedVC]);

  if (didLoading) return <Loading show={true} animation="grow" />;

  return (
    <>
      <AppUrlListener />
      <Container>
        {error && errorShow && (
          <ToastContainer position="top-end" style={{ zIndex: 1 }}>
            <Toast bg="danger">
              <Toast.Header closeButton={false} className="fw-bold font-size-lg">
                {error.section}
              </Toast.Header>
              <Toast.Body>{error.err.message}</Toast.Body>
            </Toast>
          </ToastContainer>
        )}
        {warn && warnShow && (
          <ToastContainer position="top-end" style={{ zIndex: 1 }}>
            <Toast bg="warning">
              <Toast.Header closeButton={false} className="fw-bold font-size-lg">
                {warn.section}
              </Toast.Header>
              <Toast.Body>{warn.err.message}</Toast.Body>
            </Toast>
          </ToastContainer>
        )}

        <ConfirmModal
          open={openModal}
          header={translate('credential-shared.title')}
          onClose={handleCancel}
          buttons={[
            {
              children: translate('credential-shared.button'),
              variant: 'primary',
              onClick: handleCancel,
              className: 'flex-grow-1',
            },
          ]}
        >
          <div className={styles['subtitle']}>
            {translate('credential-shared.subtitle', { type: verifiedVC?.type })}
          </div>
        </ConfirmModal>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;
