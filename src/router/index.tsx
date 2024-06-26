// import { ComponentType } from 'react';
import { RouteObject, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppContext } from 'src/store';
import Layout from 'src/containers/Layout';
import Intro from 'src/pages/Intro';
import Register from 'src/pages/Register';
// import Confirm from 'src/pages/Confirm';
import Created from 'src/pages/Created';
// import Recover from 'src/pages/Recover';
import Credentials from 'src/pages/Credentials';
import Connection from 'src/pages/Connection';
import Verify from 'src/pages/Verify';
import Loading from 'src/components/Loading';
import Scan from 'src/pages/Scan';
import Download from 'src/pages/Download';
import AppUrlListener from 'src/components/AppUrlListener';

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
      { path: '/register', element: <Register /> },
      // { path: '/confirm', element: <Confirm /> },
      { path: '/created', element: <Created /> },
      { path: '/verify', element: <Verify /> },
      // { path: '/import', element: <Recover /> },
      { path: '/connect', element: <Connection /> },
      { path: '/scan', element: <Scan /> },
    ],
  },
];

function DefaultRoute(): JSX.Element {
  const { state } = useAppContext();
  const shouldRenderCredentials = !state.didLoading && state.did;
  return (
    <>
      {state.didLoading ? (
        <Loading show={true} animation="grow" />
      ) : (
        <>
          <AppUrlListener />
          {!shouldRenderCredentials && <Navigate to="/intro" />}
          {shouldRenderCredentials && <Credentials />}
        </>
      )}
    </>
  );
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
