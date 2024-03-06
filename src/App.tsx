import routes from 'src/router';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './store';
import { Backup } from 'src/services/backup';

function App() {
  return (
    <AppProvider>
      <div className="app__container">
        <Backup />
        <RouterProvider router={routes} />
      </div>
    </AppProvider>
  );
}

export default App;
