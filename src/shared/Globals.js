// @flow
/**
 * @author Pim de Witte (pimdewitte.me/pimdewitte95@gmail.com). Copyright MSF UK 2016.
 *
 * Globals is a class that stores static variables throughout the application.
 * This include things such as the AuthenticationManager, the Model, and the Database connection.
 * It also stores stuff such as the screen dimentions and server variables.
 */

import { Platform, Dimensions } from 'react-native';

// const AuthManager = require('./AuthManager')

// var authManager = new AuthManager();

// var Analytics = require('react-native-firebase-analytics');

// const Database = require('./Database');
import Database from './Database';

// FIXME: check the old calculation to include status bar and soft menu
const screenHeight = Dimensions.get('window').height;

module.exports = {
    STORE_KEY: 'a56z0fzrNpl^2',
    BASE_URL: 'http://api.mapswipe.org:3000',
    FILE_PATH: '',
    TOP_OFFSET: Platform.OS === 'android' ? 0 : 20,
    SCREEN_WIDTH: Dimensions.get('window').width,
    SCREEN_HEIGHT: screenHeight,
    COLOR: {
        ORANGE: '#C50',
        DARKBLUE: '#0F3274',
        LIGHTBLUE: '#6EA8DA',
        DARKGRAY: '#999',
    },
    TASKS_PROCESSING: 0,
    TILE_VIEW_HEIGHT: (screenHeight - 40 - 30) / screenHeight, // 40 is top bar, 30 is bottom bar
    TILES_PER_VIEW_X: 2,
    TILES_PER_VIEW_Y: 3,
    TILE_VIEW_WIDTH: 1,
    // AUTH_MANAGER: authManager,
    DB: Database,
    GRADIENT_COUNT: 0,
    TUT_LINK: 'http://www.missingmaps.org/blog/2016/07/18/mapswipetutorial/',
    // ANALYTICS: Analytics,
};
