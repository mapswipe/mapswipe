/** @format */
// @flow

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react-native';
import './src/shared/i18n';
import Main from './src/shared/Main';
import { name as appName } from './app';
import setupStore from './src/shared/store';

Sentry.init({
    dsn: 'https://b5a9356c68a4484c9891484f8a12d016@sentry.io/1326755',
});

type Props = {};

// eslint-disable-next-line react/prefer-stateless-function
class ConnectedApp extends React.Component<Props> {
    render() {
        return (
            <Provider store={setupStore()}>
                <Main />
            </Provider>
        );
    }
}

AppRegistry.registerComponent(appName, () => ConnectedApp);
