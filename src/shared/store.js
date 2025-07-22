// @flow
import { Platform } from 'react-native';
import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { getFirebase } from 'react-redux-firebase';
import { composeWithDevTools } from 'redux-devtools-extension';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import reducers from './reducers/index';

export const loggerMiddleware = store => next => action => {
    console.debug('action', action);
    const result = next(action);
    console.debug('state', store.getState());
    return result;
};

export const reactreduxFirebaseConfig = {
    attachAuthIsReady: true,
    enableRedirectHandling: false,
    userProfile: 'v2/users',
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
        port: 8081,
        realtime: true,
    });
}

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};

const persistedReducers = persistReducer(persistConfig, reducers);

const mergeTutorialMiddleware = store => next => action => {
    if (action.type !== '@@reactReduxFirebase/SET') {
        return next(action);
    }

    const storeAs = action.path;
    if (!storeAs) {
        return next(action);
    }

    const match = storeAs.match(/^tutorials\/(.+)\/groups$/);
    if (!match) {
        return next(action);
    }

    // eslint-disable-next-line no-unused-vars
    const [_, projectId] = match;

    const currentData =
        store.getState().firebase.data?.tutorials?.[projectId]?.groups || {};

    const finalData = {};
    Object.keys(action.data).forEach(key => {
        finalData[key] = {
            ...action.data[key],
            tasks: currentData[key]?.tasks,
        };
    });
    return next({ ...action, data: finalData });
};

const mergeGroupsMiddleware = store => next => action => {
    if (action.type !== '@@reactReduxFirebase/SET') {
        return next(action);
    }

    const storeAs = action.path;
    if (!storeAs) {
        return next(action);
    }

    const match = storeAs.match(/^projects\/(.+)\/groups$/);
    if (!match) {
        return next(action);
    }

    // eslint-disable-next-line no-unused-vars
    const [_, projectId] = match;

    const currentData =
        store.getState().firebase.data?.projects?.[projectId]?.groups || {};

    const finalData = {};
    Object.keys(action.data).forEach(key => {
        finalData[key] = {
            ...action.data[key],
            tasks: currentData[key]?.tasks,
        };
    });
    return next({ ...action, data: finalData });
};

// the initial state argument is only used for jest
// direct imports of createNewStore should only happen in tests
// $FlowFixMe
export const createNewStore = (initialState?: {} = {}): any =>
    createStore(
        persistedReducers,
        initialState,
        composeEnhancers(
            applyMiddleware(
                mergeGroupsMiddleware,
                mergeTutorialMiddleware,
                thunkMiddleware.withExtraArgument(getFirebase),
                loggerMiddleware,
            ),
        ),
    );

// this is the main store used by the app
const store = createNewStore();
const persistor = persistStore(store);

export default function setupStore(): { persistor: any, store: any } {
    return { store, persistor };
}
