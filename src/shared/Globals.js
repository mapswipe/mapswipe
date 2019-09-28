// @flow
import { Platform, Dimensions } from 'react-native';

// var Analytics = require('react-native-firebase-analytics');

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
    TOP_OFFSET: Platform.OS === 'android' ? 0 : 20,
    SCREEN_WIDTH: screenWidth,
    SCREEN_HEIGHT: screenHeight,
    TILE_VIEW_HEIGHT: tileViewHeight,
    TILES_PER_VIEW_X: tilesPerViewX,
    TILES_PER_VIEW_Y: tilesPerViewY,
    TILE_SIZE: tileSize,
    DB: Database,
    TUT_LINK: 'http://www.missingmaps.org/blog/2016/07/18/mapswipetutorial/',
    // ANALYTICS: Analytics,
    SUPPORTED_PROJECT_TYPES: [
        LEGACY_TILES,
        BUILDING_FOOTPRINTS,
        CHANGE_DETECTION,
    ],
};
