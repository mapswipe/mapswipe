/** @format */

// import polyfills to prevent weird errors without remote debugging
// https://github.com/facebook/react-native/issues/20902#issuecomment-431177779
import '@babel/polyfill';

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import Main from './src/shared/Main';
import {name as appName} from './app.json';
import setupStore from './src/shared/store';

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
