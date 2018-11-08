import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { user } from './ui';

const ui = combineReducers({
    user,
});

const rootReducers = combineReducers({
    firebase: firebaseReducer,
    ui,
});

export default rootReducers;
