import routes from 'src/router';
import { RouterProvider } from 'react-router-dom';
import { StateProvider } from './store';
function App() {
  return (
    <StateProvider>
      <RouterProvider router={routes} />
    </StateProvider>
  );
}

export default App;
