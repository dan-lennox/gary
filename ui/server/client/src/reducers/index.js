import { combineReducers } from 'redux';
import countriesReducer from './countriesReducer';

export default combineReducers({
  //auth: authReducer,  // The 'auth' piece of state is managed by our authReducer.
  countries: countriesReducer
});