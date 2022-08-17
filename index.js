/** @format */
// @flow
import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/analytics';
import '@react-native-firebase/database';
import '@react-native-firebase/storage';
import * as Sentry from '@sentry/react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import './src/shared/i18n';
import Main from './src/shared/Main';
import { name as appName } from './app';
import setupStore, {
    reactreduxFirebaseConfig as rrfConfig,
} from './src/shared/store';

if (!__DEV__) {
    Sentry.init({
        dsn: 'https://b5a9356c68a4484c9891484f8a12d016@sentry.io/1326755',
    });
}

type Props = {};

const { store, persistor } = setupStore();

const client = new ApolloClient({
    uri: 'https://mapswipe-api.dev.togglecorp.com/graphql/',
    cache: new InMemoryCache(),
});

const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
};

// eslint-disable-next-line react/prefer-stateless-function
class ConnectedApp extends React.Component<Props> {
    render() {
        return (
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <ReactReduxFirebaseProvider {...rrfProps}>
                        <PersistGate loading={null} persistor={persistor}>
                            <Main />
                        </PersistGate>
                    </ReactReduxFirebaseProvider>
                </Provider>
            </ApolloProvider>
        );
    }
}

AppRegistry.registerComponent(appName, () => ConnectedApp);
