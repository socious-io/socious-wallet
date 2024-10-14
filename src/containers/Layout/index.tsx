import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import Loading from 'src/components/Loading';
import AppUrlListener from 'src/containers/AppUrlListener';
import ConfirmModal from 'src/components/ConfirmModal';
import { config } from 'src/config';

const Layout = () => {
  const { state } = useAppContext();
  const { t: translate } = useTranslation();
  const { warn, error, didLoading, verifiedVC } = state || {};
  const [warnShow, setWarnShow] = useState(false);
  const [errorShow, setErrorShow] = useState(false);
  const [openModal, setOpentModal] = useState(false);

  const handleCancel = () => setOpentModal(false);

  useEffect(() => {
    if (warn) setWarnShow(true);
    setInterval(() => setWarnShow(false), 3000);
  }, [warn]);

  useEffect(() => {
    if (error) setErrorShow(true);
    setInterval(() => setErrorShow(false), 8000);
  }, [error]);

  useEffect(() => {
    if (verifiedVC?.type) setOpentModal(true);
    setInterval(() => setErrorShow(false), 8000);
  }, [verifiedVC]);

  if (didLoading) return <Loading show={true} animation="grow" />;

  return (
    <>
      {!config.DEBUG && config.PLATFORM === 'web' && <Navigate to="download" />}
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
          header={translate('connection-confirm.header')}
          onClose={handleCancel}
          buttons={[
            {
              children: translate('connection-confirm.cancel-button'),
              variant: 'light',
              onClick: handleCancel,
              className: 'flex-grow-1 border-solid',
            },
          ]}
        >
          <div>
            {translate('connection-confirm.title')}
            <span>{translate('connection-confirm.subtitle')}</span>
          </div>
        </ConfirmModal>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;
