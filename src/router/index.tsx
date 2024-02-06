import { ComponentType } from 'react';
import { RouteObject, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppState } from 'src/store';
import Layout from 'src/components/layout';
import Register from 'src/pages/register';
import CenteredSpinner from 'src/components/spinner';
import Recover from 'src/pages/recover';
import Intro from 'src/pages/intro';
import Home from 'src/pages/home';
import Connection from 'src/pages/connection';

export const blueprint: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DefaultRoute /> },
      { path: '/connect', element: <Connection /> },
      { path: '/intro', element: <Intro /> },
      { path: '/recover', element: <Recover /> },
      { path: '/register', element: <Register /> },
    ],
  },
];

function DefaultRoute(): JSX.Element {
  const state = useAppState();
  if (state.didLoading) return <CenteredSpinner show={true} />;

  if (!state.did) return <Navigate to="/intro" />;

  return <Home />;
}

function Protect<T extends {}>(Component: ComponentType<T>): ComponentType<T> {
  return function ProtectedRoute(props: T) {
    const state = useAppState();

    if (state.didLoading) return <CenteredSpinner show={true} />;
    if (!state.did) return <Navigate to="/intro" />;

    return <Component {...props} />;
  };
}

export default createBrowserRouter(blueprint);
