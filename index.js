/** @format */

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { Sentry } from 'react-native-sentry';
import Main from './src/shared/Main';
import { name as appName } from './app.json';
import setupStore from './src/shared/store';

Sentry.config('https://b5a9356c68a4484c9891484f8a12d016@sentry.io/1326755').install();

class ConnectedApp extends React.Component {
    render() {
        return (
            <Provider store={setupStore()}>
                <Main />
            </Provider>
        );
    }
}


AppRegistry.registerComponent(appName, () => ConnectedApp);
