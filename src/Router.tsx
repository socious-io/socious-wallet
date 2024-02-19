import { createBrowserRouter } from 'react-router-dom';
import Landing from './pages/Landing';
import ConfirmMnemonic from './pages/ConfirmMnemonic';
import CreateMnemonic from './pages/CreateMnemonic';

const router = createBrowserRouter([
  { path: '/', Component: Landing },
  { path: '/confirm-mnemonic', Component: ConfirmMnemonic },
  { path: '/create-mnemonic', Component: CreateMnemonic },
]);

export default router;
