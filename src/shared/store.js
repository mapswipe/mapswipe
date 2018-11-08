import { compose, createStore } from 'redux';
import firebase from 'react-native-firebase';
import { reactReduxFirebase } from 'react-redux-firebase';
import reducers from './reducers/index';

const reactFirebaseConfig = {
    enableRedirectHandling: false,
    userProfile: 'users',
};

export const store = createStore(
    reducers,
    compose(
        reactReduxFirebase(firebase, reactFirebaseConfig),
    ),
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default function setupStore() {
    return store;
}
