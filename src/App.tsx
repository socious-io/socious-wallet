import routes from 'src/router';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './store';
// import { Backup } from 'src/services/backup';
import { init } from './services/datadog';
import { Activation } from 'src/services/activation';

init();

function App() {
  return (
    <AppProvider>
      <div className="app__container">
        <Activation />
        <RouterProvider router={routes} />
      </div>
    </AppProvider>
  );
}

export default App;
