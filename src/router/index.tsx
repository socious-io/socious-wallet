// import { ComponentType } from 'react';
import { RouteObject, createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { useAppContext } from 'src/store/context';
import Layout from 'src/containers/Layout';
import Intro from 'src/pages/Intro';
// import Register from 'src/pages/Register';
// import Confirm from 'src/pages/Confirm';
import Created from 'src/pages/Created';
import Recover from 'src/pages/Recover';
import Credentials from 'src/pages/Credentials';
import Connection from 'src/pages/Connection';
import Verify from 'src/pages/Verify';
import Loading from 'src/components/Loading';
import Scan from 'src/pages/Scan';
import Download from 'src/pages/Download';
import AppUrlListener from 'src/containers/AppUrlListener';
import Settings from 'src/pages/Settings';
import SetupPass from 'src/pages/SetupPass';
import CreatePass from 'src/pages/CreatePass';
import EnterPass from 'src/pages/EnterPass';
import Backup from 'src/pages/Backup';
import { config } from 'src/config';
import { App as CapApp } from '@capacitor/app';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const blueprint: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/credentials" replace /> },
      {
        path: '/credentials',
        element: <DefaultRoute />,
        children: [{ path: ':id' }],
      },
      { path: '/download', element: <Download /> },
      { path: '/intro', element: <Intro /> },
      { path: '/setup-pass', element: <SetupPass /> },
      { path: '/create-pass', element: <CreatePass /> },
      { path: '/enter-pass', element: <EnterPass /> },
      { path: '/backup', element: <Backup /> },
      // { path: '/register', element: <Register /> },
      // { path: '/confirm', element: <Confirm /> },
      { path: '/created', element: <Created /> },
      { path: '/verify', element: <Verify /> },
      { path: '/import', element: <Recover /> },
      { path: '/connect', element: <Connection /> },
      { path: '/settings', element: <Settings /> },
      { path: '/scan', element: <Scan /> },
    ],
    errorElement: <ErrorBoundary />,
  },
];

function DefaultRoute(): JSX.Element {
  const { state } = useAppContext();
  const shouldRenderCredentials = !state.didLoading && state.did;
  const hasPasscode = localStorage.getItem('passcode') || '';
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp();
      } else {
        // Navigate back
        navigate(-1);
      }
    });
  }, [location.pathname, navigate]);
  return (
    <>
      {state.didLoading ? (
        <Loading show={true} animation="grow" />
      ) : (
        <>
          <AppUrlListener />
          {!shouldRenderCredentials && <Navigate to="/intro" />}
          {shouldRenderCredentials && (hasPasscode ? <Credentials /> : <Navigate to="/setup-pass" />)}
        </>
      )}
    </>
  );
}

function ErrorBoundary() {
  const error: any = useRouteError();
  return <p>Oops, {error?.data}</p>;
}

// function Protect<T extends Record<string, never>>(Component: ComponentType<T>): ComponentType<T> {
//   return function ProtectedRoute(props: T) {
//     const state = useAppState();

//     if (state.didLoading) return <CenteredSpinner show={true} />;
//     if (!state.did) return <Navigate to="/intro" />;

//     return <Component {...props} />;
//   };
// }

export default createBrowserRouter(blueprint);
