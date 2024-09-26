import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/redux';
import reportWebVitals from './reportWebVitals';
import App from './App';
import ErrorBoundary from './containers/ErrorBoundary';
import './styles/main.scss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (module.hot) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  module.hot.accept('./App', () => {
    try {
      // Any code that triggers a HMR update
    } catch (error) {
      console.error('Error in the hot update:', error);
    }
  });
}

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  // const error = event.reason;
  // Call your logging utility function here
  // logger(error);
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
