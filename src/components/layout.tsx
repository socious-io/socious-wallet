import { Outlet, Link } from 'react-router-dom';
import { useAppState } from 'src/store';
import CenteredSpinner from './spinner';
import { useEffect, useState } from 'react';
import { Alert, Container, Navbar, Nav } from 'react-bootstrap';

const Layout = () => {
  const { warn, error, didLoading } = useAppState();
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

  if (didLoading) return <CenteredSpinner show={true} />;

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">Socious Wallet</Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Credentials
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
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
    </>
  );
};

export default Layout;
