// import { ComponentType } from 'react';
import { RouteObject, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppContext } from 'src/store';
import Layout from 'src/containers/Layout';
import Intro from 'src/pages/Intro';
import Register from 'src/pages/Register';
import Recover from 'src/pages/Recover';
import Home from 'src/pages/Home';
import Connection from 'src/pages/Connection';
import Verify from 'src/pages/Verify';
import Loading from 'src/components/Loading';

export const blueprint: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DefaultRoute /> },
      { path: '/intro', element: <Intro /> },
      { path: '/register', element: <Register /> },
      { path: '/verify', element: <Verify /> },
      { path: '/recover', element: <Recover /> },
      { path: '/connect', element: <Connection /> },
    ],
  },
];

function DefaultRoute(): JSX.Element {
  const { state } = useAppContext();
  if (state.didLoading) return <Loading show={true} animation="grow" />;

  if (!state.did) return <Navigate to="/intro" />;

  return <Home />;
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
