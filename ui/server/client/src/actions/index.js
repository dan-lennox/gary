import axios from 'axios';

import { FETCH_COUNTRIES } from './types';

export const fetchCountries = () => async dispatch => {
  const res = await axios.get('/api/ui/countries');
  dispatch({ type: FETCH_COUNTRIES, payload: res.data });
};