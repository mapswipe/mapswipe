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
// $FlowIssue[cannot-resolve-module]
import {
    ApolloLink,
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import 'intl';
import 'intl/locale-data/jsonp/en';

import 'intl/locale-data/jsonp/cs';
import 'intl/locale-data/jsonp/da';
import 'intl/locale-data/jsonp/de';
import 'intl/locale-data/jsonp/et';
import 'intl/locale-data/jsonp/es';
import 'intl/locale-data/jsonp/fa-AF';
import 'intl/locale-data/jsonp/fr';
import 'intl/locale-data/jsonp/it';
import 'intl/locale-data/jsonp/hu';
import 'intl/locale-data/jsonp/ja';
import 'intl/locale-data/jsonp/ne';
import 'intl/locale-data/jsonp/nl';
import 'intl/locale-data/jsonp/pt';
import 'intl/locale-data/jsonp/ru';
import 'intl/locale-data/jsonp/sw';
import 'intl/locale-data/jsonp/zh';

import {
    sentryDsnUrl,
    gqlEndpoint,
    referrerEndpoint,
} from './src/shared/constants';
import { fetchCsrfToken, getCsrfToken } from './src/shared/csrfToken';
import './src/shared/i18n';
import Main from './src/shared/Main';
import { name as appName } from './app';
import setupStore, {
    reactreduxFirebaseConfig as rrfConfig,
} from './src/shared/store';

if (!__DEV__) {
    Sentry.init({
        dsn: sentryDsnUrl,
        // dsn: 'https://b5a9356c68a4484c9891484f8a12d016@sentry.io/1326755',
    });
}

type Props = {};

const { store, persistor } = setupStore();

const csrfLink = setContext(async (_, { headers }) => {
    const csrfToken = await getCsrfToken();

    return {
        headers: {
            ...headers,
            'X-CSRFToken': csrfToken || '',
            Referer: referrerEndpoint,
        },
    };
});
const httpLink = createHttpLink({
    uri: gqlEndpoint,
    credentials: 'include',
});

const client = new ApolloClient({
    link: ApolloLink.from([csrfLink, httpLink]),
    cache: new InMemoryCache(),
});

const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
};

// eslint-disable-next-line react/prefer-stateless-function
class ConnectedApp extends React.Component<Props> {
    componentDidMount() {
        fetchCsrfToken();
    }

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
