import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useAppContext } from 'src/store/context';
import Loading from 'src/components/Loading';
import AppUrlListener from 'src/containers/AppUrlListener';
import { config } from 'src/config';

const Layout = () => {
  const { state } = useAppContext();
  const { warn, error, didLoading, device } = state || {};
  const [warnShow, setWarnShow] = useState(false);
  const [errorShow, setErrorShow] = useState(false);

  useEffect(() => {
    if (warn) setWarnShow(true);
    setInterval(() => setWarnShow(false), 3000);
  }, [warn]);

  useEffect(() => {
    if (error) setErrorShow(true);
    setInterval(() => setErrorShow(false), 8000);
  }, [error]);

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
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;
