// @flow
import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import results from './results';
import user from './ui';

const ui = combineReducers({
    user,
});

const rootReducers = combineReducers({
    firebase: firebaseReducer,
    results,
    ui,
});

export default rootReducers;
