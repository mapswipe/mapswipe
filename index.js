/** @format */

// import polyfills to prevent weird errors without remote debugging
// https://github.com/facebook/react-native/issues/20902#issuecomment-431177779
import '@babel/polyfill';

import {AppRegistry} from 'react-native';
import Main from './src/shared/Main.js';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Main);
