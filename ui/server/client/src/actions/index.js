import axios from 'axios';

import { FETCH_USER, FETCH_COUNTRIES } from './types';

export const fetchCountries = () => async dispatch => {
  const res = await axios.get('/api/ui/countries');
  dispatch({ type: FETCH_COUNTRIES, payload: res.data });
};

export const fetchUser = () => async dispatch => {

  console.log('fetch user called.');
  const res = await axios.get('/api/ui/user');

  console.log(res);

  dispatch({ type: FETCH_USER, payload: res.data });
};