// @flow
import * as React from 'react';
import {
    Animated,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    type LayoutEvent,
    type PressEvent,
} from 'react-native/Libraries/Types/CoreEventTypes';
import type {
    GestureState,
    PanResponderInstance,
} from 'react-native/Libraries/Interaction/PanResponder';
import { Path, Shape, Surface } from '@react-native-community/art';
import tilebelt from '@mapbox/tilebelt';
import { getTileUrlFromCoordsAndTileserver } from '../../common/tile_functions';
import ScaleBar from '../../common/ScaleBar';
import { COLOR_WHITE } from '../../constants';
import type {
    BBOX,
    ImageCoordsPoint,
    LonLatPoint,
    LonLatPolygon,
    PixelCoordsPoint,
    PixelCoordsX,
    PixelCoordsY,
    Point,
    Polygon,
    SingleImageryProjectType,
    BuildingFootprintTaskType,
    Tile,
    ZoomLevel,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

// tileSize is only used for tile based imagery (ie: everything but google)
const tileSize = GLOBAL.SCREEN_WIDTH;

const styles = StyleSheet.create({
    attribution: {
        color: COLOR_WHITE,
        fontSize: 7,
        fontWeight: '300',
    },
    attributionView: {
        backgroundColor: '#444444',
        padding: 1,
        position: 'absolute',
    },
    tileImg: {
        height: tileSize,
        position: 'absolute',
        width: tileSize,
    },
});

type Props = {
    nextTask: () => boolean,
    prefetchTask: BuildingFootprintTaskType,
    previousTask: () => boolean,
    project: SingleImageryProjectType,
    task: BuildingFootprintTaskType,
};

type State = {
    animatedMarginLeft: Animated.Value,
    animatedMarginRight: Animated.Value,
};

export default class FootprintDisplay extends React.Component<Props, State> {
    panResponder: PanResponderInstance;

    swipeThreshold: number;

    // the imagery is shown as a rectangle, whose size is computed to fill
    // in the screen as much as possible. The width is the same as the screen, and
    // for the height, we rely on flexbox to size the different components, which means that the
    // first rendering is when we find out how much space we have for the imagery.
    // so we first set this value to null, and update it once flexbox has given us a height.
    // Only then can we pull imagery
    imageryHeight: number;

    // keep a set of prefetched imagery urls to avoid sending the request multiple
    // times for a single image. It's not clear from RN docs whether the prefetch
    // method prevents duplicate requests, so let's do it here to be safe
    prefetchedUrls: Set<string>;

    constructor(props: Props) {
        super(props);
        // swipeThreshold defines how much movement is needed to start considering the event
        // as a swipe. This used to be a fixed value, we now link it to screen size (through the tile size)
        // so that it should work across screen densities.
        this.swipeThreshold = GLOBAL.TILE_SIZE * 0.02;
        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onMoveShouldSetPanResponderCapture: this
                .handleMoveShouldSetPanResponder,
            onPanResponderRelease: this.handlePanResponderEnd,
        });
        this.state = {
            animatedMarginLeft: new Animated.Value(0),
            animatedMarginRight: new Animated.Value(0),
        };
        this.imageryHeight = 0;
        this.prefetchedUrls = new Set();
    }

    componentDidUpdate(prevProps: Props) {
        // try to prefetch the next task's imagery so it displays instantly when
        // we reach it
        const { prefetchTask, project } = this.props;
        if (
            prefetchTask !== prevProps.prefetchTask &&
            prefetchTask !== undefined
        ) {
            console.log('prefetch images');

            const coords = prefetchTask.geojson.coordinates[0];
            const zoomLevel = this.getZoomLevelFromCoords(coords);

            if (
                project.tileServer.url.includes('googleapis') &&
                this.imageryHeight !== 0
            ) {
                const prefetchUrl = this.getGoogleImageryUrl(
                    project.tileServer.url,
                    prefetchTask,
                    GLOBAL.SCREEN_WIDTH,
                    this.imageryHeight,
                    zoomLevel,
                );
                Image.prefetch(prefetchUrl);
            } else {
                // all other, tile-based, imagery
                const { tileUrls } = this.getTMSImageryUrls(
                    prefetchTask,
                    zoomLevel,
                );
                tileUrls.map((url) => {
                    if (!this.prefetchedUrls.has(url)) {
                        Image.prefetch(url);
                        this.prefetchedUrls.add(url);
                    }
                    // return something to keep flow happy
                    return null;
                });
            }
        } else {
            console.log('will not prefetch imagery');
        }
    }

    onLayout = (event: LayoutEvent) => {
        const { height } = event.nativeEvent.layout;
        if (height !== this.imageryHeight) {
            this.imageryHeight = height;
            this.forceUpdate();
        }
    };

    handleMoveShouldSetPanResponder = (
        // decide if we handle the move event: only if it's horizontal
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => Math.abs(gestureState.dx) > this.swipeThreshold;

    bounceImage = (direction: string) => {
        // bounce the image left or right when the user tries to swipe past what
        // they're allowed to, to give them some visual feedback
        const { animatedMarginLeft, animatedMarginRight } = this.state;
        let value;
        if (direction === 'left') {
            value = animatedMarginRight;
        } else {
            value = animatedMarginLeft;
        }
        Animated.sequence([
            Animated.timing(value, {
                toValue: 100,
                duration: 100,
                useNativeDriver: false,
            }),
            Animated.timing(value, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false,
            }),
        ]).start();
    };

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        const { nextTask, previousTask } = this.props;
        // we only accept swipes longer than 10% of the screen width
        const swipeMinLength = 0.1;
        if (gestureState.dx < -GLOBAL.SCREEN_WIDTH * swipeMinLength) {
            const bounceAtEnd = nextTask();
            if (bounceAtEnd) {
                this.bounceImage('left');
            }
        } else if (gestureState.dx > GLOBAL.SCREEN_WIDTH * swipeMinLength) {
            const bounceAtEnd = previousTask();
            if (bounceAtEnd) {
                this.bounceImage('right');
            }
        }
    };

    /*
     * Get the polygon to draw over the image
     */
    getPolygon = (coords: Polygon, screenBBox: BBOX): Path => {
        const [minLon, minLat, maxLon, maxLat] = screenBBox;
        // geographic coords to screen pixels
        const lon2x = (lon) =>
            ((lon - minLon) / (maxLon - minLon)) * this.imageryHeight;
        const lat2y = (lat) =>
            (1 - (lat - minLat) / (maxLat - minLat)) * this.imageryHeight;
        const p = Path().moveTo(lon2x(coords[0][0]), lat2y(coords[0][1]));
        coords.forEach((corner) => {
            p.lineTo(lon2x(corner[0]), lat2y(corner[1]));
        });
        p.close();
        return p;
    };

    /*
     * Get the building bounding box (in real coordinates)
     */
    getBuildingBBox = (coords: LonLatPolygon): BBOX => {
        // This only works if the geometry type is 'POLYGON'.
        // A geometry of type 'MULTIPOLYGON' will not work here
        const lons = coords.map((p) => p[0]).sort();
        const lats = coords.map((p) => p[1]).sort();
        return [lons[0], lats[0], lons[lons.length - 1], lats[lats.length - 1]];
    };

    // return the center of the building footprint
    getTaskGeometryCentroid = (coords: LonLatPolygon): LonLatPoint => {
        const centroid: Point = coords
            .slice(0, -1)
            .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]]);
        // $FlowFixMe
        return centroid.map((c) => c / (coords.length - 1));
    };

    // return a bouding box to zoom to as [W, S, E, N]
    // which has the same size as a tile at these coordinates and zoom level
    getScreenBBoxFromCenter = (center: Point, zoom: ZoomLevel): BBOX => {
        const lon = center[0];
        const lat = center[1];
        const centerTile = tilebelt.pointToTile(lon, lat, zoom);
        // calculate width and height of the tile in degrees
        const tileBBOX = tilebelt.tileToBBOX(centerTile);
        const tileW = tileBBOX[2] - tileBBOX[0];
        const tileH = tileBBOX[3] - tileBBOX[1];
        return [
            lon - tileW / 2,
            lat - tileH / 2,
            lon + tileW / 2,
            lat + tileH / 2,
        ];
    };

    latLonZoomToPixelCoords = (
        lonLat: LonLatPoint,
        zoom: ZoomLevel,
        pixelsPerTile: ?number,
    ): PixelCoordsPoint => {
        // returns the point in pixel coords for the given zoom level.
        // https://docs.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system#pixel-coordinates
        // for more details on pixel coords
        // pixelsPerTile should almost always be 256, but here we cheat and make it the width of
        // the screen. This essentially stretches the tile as if we had "big pixels"
        const pxPerTile = pixelsPerTile || 256;

        const [lon, lat] = lonLat;
        const sinLat = Math.sin((lat * Math.PI) / 180);
        const x = ((lon + 180) / 360) * pxPerTile * 2 ** zoom;
        const y =
            (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
            pxPerTile *
            2 ** zoom;
        return [Math.floor(x), Math.floor(y)];
    };

    pixelCoordsToImageCoords = (
        pointPixelCoords: PixelCoordsPoint,
        minX: PixelCoordsX, // pixel coord of left side of the screen
        minY: PixelCoordsY, // pixel coord of top of the screen
    ): ImageCoordsPoint => {
        return [pointPixelCoords[0] - minX, pointPixelCoords[1] - minY];
    };

    getGooglePolygonFromCenter = (
        center: Point,
        zoom: ZoomLevel,
        taskCoords: LonLatPolygon,
    ): Path => {
        // get the polygon in ART Path format, expressed in image coordinates,
        // for the task geometry. Arguments:
        // center: the center as [longitude, latitude]
        // zoom: standard zoom level
        // taskCoords: the coordinates of the task geometry, each point as [lon, lat]
        // This only works for google imagery

        // get bounding box coordinates in geographic pixels
        const centerPixelCoords = this.latLonZoomToPixelCoords(center, zoom);
        const minX = centerPixelCoords[0] - GLOBAL.SCREEN_WIDTH / 2;
        const minY = centerPixelCoords[1] - this.imageryHeight / 2;

        // geographic coords to screen pixels
        const taskImageCoords = taskCoords.map((tc) =>
            this.pixelCoordsToImageCoords(
                this.latLonZoomToPixelCoords(tc, zoom),
                minX,
                minY,
            ),
        );

        const p = Path().moveTo(taskImageCoords[0][0], taskImageCoords[0][1]);
        taskImageCoords.forEach((corner) => {
            p.lineTo(corner[0], corner[1]);
        });
        return p;
    };

    getTMSPolygonFromCenter = (
        center: Point,
        zoom: ZoomLevel,
        taskCoords: LonLatPolygon,
    ): Path => {
        // get the polygon in ART Path format, expressed in image coordinates,
        // for the task geometry. Arguments:
        // center: the center as [longitude, latitude]
        // zoom: standard zoom level
        // taskCoords: the coordinates of the task geometry, each point as [lon, lat]
        // This only works for TMS based imagery, like Bing, maxar...

        // get bounding box coordinates in geographic pixels
        const centerPixelCoords = this.latLonZoomToPixelCoords(
            center,
            zoom,
            GLOBAL.SCREEN_WIDTH,
        );
        const minX = centerPixelCoords[0] - tileSize / 2;
        const minY = centerPixelCoords[1] - tileSize / 2;

        // geographic coords to screen pixels
        const taskImageCoords = taskCoords.map((tc) =>
            this.pixelCoordsToImageCoords(
                this.latLonZoomToPixelCoords(tc, zoom, GLOBAL.SCREEN_WIDTH),
                minX,
                minY,
            ),
        );

        const p = Path().moveTo(taskImageCoords[0][0], taskImageCoords[0][1]);
        taskImageCoords.forEach((corner) => {
            p.lineTo(corner[0], corner[1]);
        });
        return p;
    };

    BBOXToCoords = (bbox: BBOX): LonLatPolygon => {
        const [w, s, e, n] = bbox;
        return [
            [w, s],
            [w, n],
            [e, n],
            [e, s],
        ];
    };

    getTilesFromScreenCorners = (
        corners: LonLatPolygon,
        z: ZoomLevel,
    ): Array<Tile> => {
        const sw = tilebelt.pointToTile(corners[0][0], corners[0][1], z);
        const nw = [sw[0], sw[1] - 1, z];
        const ne = [nw[0] + 1, nw[1], z];
        const se = [ne[0], sw[1], z];
        return [sw, nw, ne, se];
    };

    getTileUrl = (tile: Tile): string => {
        const { project } = this.props;
        const { apiKey, name, url } = project.tileServer;
        return getTileUrlFromCoordsAndTileserver(...tile, url, name, apiKey);
    };

    getTaskCenter = (task: BuildingFootprintTaskType): LonLatPoint => {
        // for projects that use google imagery, we can optimise the nunber of images
        // downloaded by relying on an optional `center` attribute in the task, which allows
        // us to center the imagery there instead of on the centroid of the geometry.
        // When multiple tasks are located within close proximity, this can substantially
        // reduce the cost in imagery API calls
        // This center attribute is not used with TMS imagery for the time being.
        if (task.center) {
            return task.center;
        }
        return this.getTaskGeometryCentroid(task.geojson.coordinates[0]);
    };

    getGoogleImageryUrl = (
        urlTemplate: string,
        task: BuildingFootprintTaskType,
        width: number, // in pixels
        height: number, // in pixels
        zoom: ZoomLevel,
    ) => {
        // return the url required to download imagery
        // google imagery is returned as a single image of the size we want
        // so we need a different logic, as we can't just pull 4 images
        // (each call costs money, and would include a credit line)
        const googleSize = `${width}x${height}`;
        // some projects include a `center` attribute in the task which defines
        // the center point of the imagery to use. This allows some optimisation
        // of number of imagery requests by reusing the same image for multiple
        // tasks.
        const center = this.getTaskCenter(task); // the geometry center
        const googleCenterString = `${center[1]}%2C%20${center[0]}`;

        const imageUrl = urlTemplate
            .replace('{z}', zoom.toString())
            .replace('{size}', googleSize)
            .replace('{center}', googleCenterString);
        return imageUrl;
    };

    getTMSImageryUrls = (task: BuildingFootprintTaskType, zoom: ZoomLevel) => {
        // return the 4 urls of the images to display for a task and the X, Y shifts
        // to be applied to center them on the given center point

        // get 4 tiles at zoomLevel and shift them as needed
        const center = this.getTaskGeometryCentroid(
            task.geojson.coordinates[0],
        );
        const latitude = center[1];
        const screenBBox = this.getScreenBBoxFromCenter(center, zoom);
        // build footprint polyline
        // const p = this.getPolygon(coords, screenBBox);
        // const path = this.getTaskGeometryPath(task, this.zoomLevel);
        const corners = this.BBOXToCoords(screenBBox);
        const swCornerTile = tilebelt.pointToTileFraction(
            corners[0][0],
            corners[0][1],
            zoom,
        );
        const tiles = this.getTilesFromScreenCorners(corners, zoom);
        // $FlowFixMe
        const tileUrls = tiles.map(this.getTileUrl);

        // the TMS display fetches 4 tiles from the imagery provider, and sizes
        // each one to the same width as the phone's screen. then we shift the
        // resulting image so that the shape's center is roughly aligned with
        // the center of the screen
        const shiftX = (swCornerTile[0] % 1) * tileSize;
        const shiftY = (swCornerTile[1] % 1) * tileSize;

        return { tileUrls, shiftX, shiftY, latitude };
    };

    /*
     * Get the zoom level that fits to the size of the object
     */
    getZoomLevelFromCoords = (coords: LonLatPolygon): ZoomLevel => {
        const bbox = this.getBuildingBBox(coords);

        // check for if bounding box fits into a single tile in width and height
        // at a given zoom level
        // start to check for zoom level 19 and
        // then go to lower levels when needed
        // zoom level 19 is considered here as the maximum zoom that we support
        // zoom level 14 is the minimum zoom level
        let tileZ = 19;
        while (tileZ >= 14) {
            // get the tiles for the bbox coordinates
            const tileAFraction = tilebelt.pointToTileFraction(
                bbox[0],
                bbox[1],
                tileZ,
            );
            const tileBFraction = tilebelt.pointToTileFraction(
                bbox[2],
                bbox[3],
                tileZ,
            );

            // check if bbox fits into one tile at this zoom level
            // need to check in x and y dimensions
            const yDifference = Math.abs(tileAFraction[0] - tileBFraction[0]);
            const xDifference = Math.abs(tileAFraction[1] - tileBFraction[1]);

            if (yDifference < 1 && xDifference < 1) {
                // x dimension and y dimension fit into a box with the size of one tile
                break;
            }
            tileZ -= 1;
        }
        return tileZ;
    };

    getTaskGeometryPath = (
        task: BuildingFootprintTaskType,
        zoom: ZoomLevel,
    ): Path => {
        const { project } = this.props;
        if (project.tileServer.url.includes('googleapis')) {
            // google imagery works in a non-standard way
            const center = this.getTaskCenter(task); // the geometry center
            return this.getGooglePolygonFromCenter(
                center,
                zoom,
                task.geojson.coordinates[0],
            );
        }
        // all other imagery relies on tiles
        const center = this.getTaskGeometryCentroid(
            task.geojson.coordinates[0],
        );
        return this.getTMSPolygonFromCenter(
            center,
            zoom,
            task.geojson.coordinates[0],
        );
    };

    render = () => {
        const { project, task } = this.props;
        const { animatedMarginLeft, animatedMarginRight } = this.state;
        if (task.geojson === undefined || this.imageryHeight === 0) {
            // data is not ready yet, just show a placeholder
            return (
                <View
                    onLayout={this.onLayout}
                    style={{
                        flex: 1,
                        width: GLOBAL.SCREEN_WIDTH,
                    }}
                />
            );
        }
        const coords = task.geojson.coordinates[0];
        const zoomLevel = this.getZoomLevelFromCoords(coords);
        // get the path to be drawn on top of the imagery, as it's the same for all
        // types of imagery
        const path = this.getTaskGeometryPath(task, zoomLevel);

        if (project.tileServer.url.includes('googleapis')) {
            // use the latitude of the first point in the shape as reference for the scalebar
            // it's not exactly correct, but the difference is negligible
            const imageUrl = this.getGoogleImageryUrl(
                project.tileServer.url,
                task,
                GLOBAL.SCREEN_WIDTH,
                this.imageryHeight,
                zoomLevel,
            );
            const latitude = coords[0][1];
            return (
                <Animated.View
                    {...this.panResponder.panHandlers}
                    style={{
                        alignSelf: 'center',
                        height: this.imageryHeight,
                        marginLeft: animatedMarginLeft,
                        marginRight: animatedMarginRight,
                        width: GLOBAL.SCREEN_WIDTH,
                        overflow: 'hidden',
                    }}
                >
                    <Image
                        style={{
                            left: 0,
                            height: this.imageryHeight,
                            position: 'absolute',
                            width: GLOBAL.SCREEN_WIDTH,
                            top: 0,
                        }}
                        source={{ uri: imageUrl }}
                    />
                    <Surface
                        height={this.imageryHeight}
                        width={GLOBAL.SCREEN_WIDTH}
                    >
                        <Shape d={path} stroke="red" strokeWidth={2} />
                    </Surface>
                    <ScaleBar
                        alignToBottom={false}
                        latitude={latitude}
                        useScreenWidth
                        visible
                        zoomLevel={zoomLevel}
                    />
                </Animated.View>
            );
        }

        // all other imagery sources work with 4 tiles shown at the same time
        // which we stretch so that 1 tile is exactly the width of the screen.
        // This
        const { tileUrls, shiftX, shiftY, latitude } = this.getTMSImageryUrls(
            task,
            zoomLevel,
        );

        const attribution = project.tileServer.credits;
        return (
            <View
                {...this.panResponder.panHandlers}
                style={{
                    // this crops the extra imagery height for phones
                    // where height is smaller than width
                    // while filling the entire screen width with imagery
                    height: this.imageryHeight,
                    overflow: 'hidden',
                    width: GLOBAL.SCREEN_WIDTH,
                }}
            >
                <View
                    // this view is square, and exactly the size of 4 imagery tiles
                    // (ie: 2 * 2 tiles)
                    // so this is drawn "beyond the screen size"
                    style={{
                        position: 'absolute',
                        left: -shiftX,
                        top: -shiftY,
                        height: tileSize * 2,
                        width: tileSize * 2,
                    }}
                >
                    <Image
                        style={[
                            {
                                left: 0,
                                top: 0,
                            },
                            styles.tileImg,
                        ]}
                        source={{ uri: tileUrls[1] }}
                    />
                    <Image
                        style={[
                            {
                                left: tileSize,
                                top: 0,
                            },
                            styles.tileImg,
                        ]}
                        source={{ uri: tileUrls[2] }}
                    />
                    <Image
                        style={[
                            {
                                left: 0,
                                top: tileSize,
                            },
                            styles.tileImg,
                        ]}
                        source={{ uri: tileUrls[0] }}
                    />
                    <Image
                        style={[
                            {
                                left: tileSize,
                                top: tileSize,
                            },
                            styles.tileImg,
                        ]}
                        source={{ uri: tileUrls[3] }}
                    />
                </View>
                <Surface
                    height={GLOBAL.SCREEN_WIDTH}
                    width={GLOBAL.SCREEN_WIDTH}
                >
                    <Shape d={path} stroke="black" strokeWidth={3} />
                    <Shape
                        d={path}
                        stroke="white"
                        strokeDash={[1, 2]}
                        strokeWidth={1}
                    />
                </Surface>
                <ScaleBar
                    alignToBottom
                    latitude={latitude}
                    useScreenWidth
                    visible
                    zoomLevel={zoomLevel}
                />
                <View style={styles.attributionView}>
                    <Text style={styles.attribution}>{attribution}</Text>
                </View>
            </View>
        );
    };
}
