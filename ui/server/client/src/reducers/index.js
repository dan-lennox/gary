import { combineReducers } from 'redux';
import countriesReducer from './countriesReducer';
import authReducer from './authReducer';

export default combineReducers({
  auth: authReducer,  // The 'auth' piece of state is managed by our authReducer.
  countries: countriesReducer
});