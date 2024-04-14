import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import Loading from 'src/components/Loading';
import { useAppContext } from 'src/store';

const Layout = () => {
  const { state } = useAppContext();
  const { warn, error, didLoading } = state || {};
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
  );
};

export default Layout;
