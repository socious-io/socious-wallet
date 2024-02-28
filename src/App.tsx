import routes from 'src/router';
import { RouterProvider } from 'react-router-dom';
import { StateProvider } from './store';
import { Backup } from 'src/services/backup';

function App() {
  return (
    <StateProvider>
      <Backup />
      <RouterProvider router={routes} />
    </StateProvider>
  );
}

export default App;
