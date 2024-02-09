import { Outlet } from 'react-router-dom';
import { useAppState } from 'src/store';
import CenteredSpinner from './spinner';
import { useConnection } from 'src/services/agent';
import { useEffect, useState } from 'react';
import { Alert, Container, Navbar, Nav } from 'react-bootstrap';

const Layout = () => {
  const state = useAppState();
  const {connectionId, connectionStatus} = useConnection()
  const [warnShow, setWarnShow] = useState(true);
  const [messageShow, setMessageShow] = useState(true);

  useEffect(() => {
    setInterval(() => setWarnShow(false), 3000);
    setInterval(() => setMessageShow(false), 3000);
  }, [state.credentials]);

  if (state.didLoading) return <CenteredSpinner show={true} />;

  return (
    <>
    <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">Socious Wallet</Navbar.Brand>
        </Container>
      </Navbar>
    <Container>
      {connectionId && 
        <Alert key="info" variant="info">
            Connection : {connectionId} : {connectionStatus}
        </Alert>
      }
      {state.credentials.length > 0 && messageShow && (
        <Alert key="info" variant="info">
          Got new credential from : {state.credentials[state.credentials.length - 1].issuer}
        </Alert>
      )}
      <Outlet />
    </Container>
    </>
  );
};

export default Layout;
