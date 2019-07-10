// @flow
import { Platform } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import firebase from 'react-native-firebase';
import { getFirebase, reactReduxFirebase } from 'react-redux-firebase';
import { composeWithDevTools } from 'remote-redux-devtools';
import reducers from './reducers/index';

const reactFirebaseConfig = {
    attachAuthIsReady: true,
    enableRedirectHandling: false,
    userProfile: 'users',
};

let composeEnhancers;
if (process.env.NODE_ENV === 'test') {
    composeEnhancers = compose;
} else {
    // do not use the redux dev tools when testing as they
    // interfere with jest
    composeEnhancers = composeWithDevTools({
        name: Platform.OS,
        hostname: 'localhost',
        port: 5678,
        realtime: false,
    });
}

// the initial state argument is only used for jest
// direct imports of createNewStore should only happen in tests
export const createNewStore = (initialState?: {} = {}) => createStore(
    reducers,
    initialState,
    composeEnhancers(
        applyMiddleware(thunkMiddleware.withExtraArgument(getFirebase)),
        reactReduxFirebase(firebase, reactFirebaseConfig),
    ),
);

// this is the main store used by the app
const store = createNewStore();

export default function setupStore() {
    return store;
}
