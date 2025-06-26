// @flow
import { Dimensions } from 'react-native';
import Database from './Database';
import {
    LEGACY_TILES,
    BUILDING_FOOTPRINTS,
    CHANGE_DETECTION,
    COMPLETENESS_PROJECT,
    IMAGE_VALIDATION,
} from './constants';

// FIXME: check the old calculation to include status bar and soft menu
const screenHeight: number = Dimensions.get('window').height;
const screenWidth: number = Dimensions.get('window').width;

const tilesPerViewX = 2;
const tilesPerViewY = 3;
const tileViewHeight = screenHeight - 40 - 30; // 40 is top bar, 30 is bottom bar

// determine the size of a tile for built area projects
const tileHeight = tileViewHeight / tilesPerViewY;
const tileWidth = screenWidth / tilesPerViewX;
const tileSize: number = Math.min(tileHeight, tileWidth);

module.exports = {
    SCREEN_WIDTH: screenWidth,
    SCREEN_HEIGHT: screenHeight,
    TILE_VIEW_HEIGHT: tileViewHeight,
    TILES_PER_VIEW_X: tilesPerViewX,
    TILES_PER_VIEW_Y: tilesPerViewY,
    TILE_SIZE: tileSize,
    DB: Database,
    TUT_LINK: 'http://www.missingmaps.org/blog/2016/07/18/mapswipetutorial/',
    SUPPORTED_PROJECT_TYPES: [
        LEGACY_TILES,
        BUILDING_FOOTPRINTS,
        CHANGE_DETECTION,
        COMPLETENESS_PROJECT,
        IMAGE_VALIDATION,
    ],
};
