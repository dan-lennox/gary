import { FETCH_USER} from '../actions/types';

export default function(state = null, action) {
  switch (action.type) {

    case FETCH_USER:
      // User is logged in: action.payload is the user object.
      return action.payload || false;
    default:
      return state;
  }
}