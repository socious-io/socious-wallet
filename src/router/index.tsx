import { RouteObject, createBrowserRouter, Navigate  } from 'react-router-dom';
import { useAppState } from 'src/store';
import Layout from 'src/components/layout';
import Register from 'src/pages/register';


export const blueprint: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DefaultRoute /> },
      { path: '/register', element: <Register /> }
    ]
  }
];

function DefaultRoute(): JSX.Element {
  const state = useAppState()
  if (state.didLoading) return <div>Loading ...</div>
  if (!state.did) return <Navigate to='/register'/>

  return <h1>Socious Wallet</h1>
}


export default createBrowserRouter(blueprint);