import { combineReducers } from 'redux';
import { auth } from './ui';

const ui = combineReducers({
    auth,
});

const rootReducers = combineReducers({
    ui,
});

export default rootReducers;
