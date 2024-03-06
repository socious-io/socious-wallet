import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
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
        <Alert variant="danger">
          <Alert.Heading>{error.section}</Alert.Heading>
          {error.err.message}
        </Alert>
      )}
      {warn && warnShow && (
        <Alert variant="warning">
          <Alert.Heading>{warn.section}</Alert.Heading>
          {warn.err.message}
        </Alert>
      )}
      <Outlet />
    </Container>
  );
};

export default Layout;
