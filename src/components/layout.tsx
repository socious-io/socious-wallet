import { Outlet } from 'react-router-dom';
import { useAppState } from 'src/store';

const Layout = () => {
    const state = useAppState()
    if (state.didLoading) return <div>Loading ...</div>
  return (
    <div className="container">

        <Outlet />
    </div>
  );
};

export default Layout;
