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
import {
    LEGACY_TILES,
    BUILDING_FOOTPRINTS,
    CHANGE_DETECTION,
} from './constants';

// FIXME: check the old calculation to include status bar and soft menu
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const tilesPerViewX = 2;
const tilesPerViewY = 3;
const tileViewHeight = screenHeight - 40 - 30; // 40 is top bar, 30 is bottom bar

// determine the size of a tile for built area projects
const tileHeight = tileViewHeight / tilesPerViewY;
const tileWidth = screenWidth / tilesPerViewX;
const tileSize = Math.min(tileHeight, tileWidth);

module.exports = {
    STORE_KEY: 'a56z0fzrNpl^2',
    BASE_URL: 'http://api.mapswipe.org:3000',
    FILE_PATH: '',
    TOP_OFFSET: Platform.OS === 'android' ? 0 : 20,
    SCREEN_WIDTH: screenWidth,
    SCREEN_HEIGHT: screenHeight,
    TASKS_PROCESSING: 0,
    TILE_VIEW_HEIGHT: tileViewHeight,
    TILES_PER_VIEW_X: tilesPerViewX,
    TILES_PER_VIEW_Y: tilesPerViewY,
    TILE_SIZE: tileSize,
    TILE_VIEW_WIDTH: 1,
    // AUTH_MANAGER: authManager,
    DB: Database,
    GRADIENT_COUNT: 0,
    TUT_LINK: 'http://www.missingmaps.org/blog/2016/07/18/mapswipetutorial/',
    // ANALYTICS: Analytics,
    SUPPORTED_PROJECT_TYPES: [
        LEGACY_TILES,
        BUILDING_FOOTPRINTS,
        CHANGE_DETECTION,
    ],
};
