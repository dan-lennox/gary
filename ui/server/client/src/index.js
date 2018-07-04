// Import materize css. Create-react-app has webpack loaders configured to
// bundle css files already.
import 'materialize-css/dist/css/materialize.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

import App from './components/App';
import reducers from './reducers';

// ReduxThunk allows us to have asynchronous actions.
const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

// The Provider component ensures that the App component and all child components have
// access to the Redux store.
ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.querySelector('#root')
);