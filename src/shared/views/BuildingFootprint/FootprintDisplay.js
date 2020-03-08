// @flow
import * as React from 'react';
import {
    Image,
    StyleSheet,
    View,
} from 'react-native';
import { Path, Shape, Surface } from '@react-native-community/art';
import tilebelt from '@mapbox/tilebelt';
import type {
    BBOX,
    Point,
    Polygon,
    ProjectType,
    BuildingFootprintTaskType,
    Tile,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

const tileSize = GLOBAL.SCREEN_WIDTH;

const styles = StyleSheet.create({
    tileImg: {
        height: tileSize,
        position: 'absolute',
        width: tileSize,
    },
});

type Props = {
    project: ProjectType,
    task: BuildingFootprintTaskType,
};

export default class FootprintDisplay extends React.Component<Props> {
    /*
     * Get the polygon to draw over the image
     */
    getPolygon = (coords: Polygon, screenBBox: BBOX) => {
        const [minLon, minLat, maxLon, maxLat] = screenBBox;
        const lon2x = (lon) => ((lon - minLon) / (maxLon - minLon)) * tileSize;
        const lat2y = (lat) => (1 - (lat - minLat) / (maxLat - minLat)) * tileSize;
        const p = Path().moveTo(lon2x(coords[0][0]), lat2y(coords[0][1]));
        coords.forEach((corner) => {
            p.lineTo(lon2x(corner[0]), lat2y(corner[1]));
        });
        p.close();
        return p;
    }

    /*
     * Get the building bounding box (in real coordinates)
     */
    getBuildingBBox = (coords: Polygon): BBOX => {
        const lons = coords.map((p) => p[0]).sort();
        const lats = coords.map((p) => p[1]).sort();
        return [lons[0], lats[0], lons[lons.length - 1], lats[lats.length - 1]];
    }

    // return the center of the building footprint
    getBuildingCentroid = (coords: Polygon): Point => {
        const centroid: Point = coords.slice(0, -1)
            .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]]);
        // $FlowFixMe
        return centroid.map((c) => c / (coords.length - 1));
    }

    // return a bouding box to zoom to as [W, S, E, N]
    // which has the same size as a tile at these coordinates and zoom level
    getScreenBBoxFromCenter = (center: Point, zoom: number) => {
        const lon = center[0];
        const lat = center[1];
        const centerTile = tilebelt.pointToTile(lon, lat, zoom);
        // calculate width and height of the tile in degrees
        const tileBBOX = tilebelt.tileToBBOX(centerTile);
        const tileW = tileBBOX[2] - tileBBOX[0];
        const tileH = tileBBOX[3] - tileBBOX[1];
        return [lon - tileW / 2, lat - tileH / 2, lon + tileW / 2, lat + tileH / 2];
    }

    BBOXToCoords = (bbox: BBOX) => {
        const [w, s, e, n] = bbox;
        return [[w, s], [w, n], [e, n], [e, s]];
    }

    getTilesFromScreenCorners = (corners: Polygon, z: number) => {
        const sw = tilebelt.pointToTile(corners[0][0], corners[0][1], z);
        const nw = [sw[0], sw[1] - 1, z];
        const ne = [nw[0] + 1, nw[1], z];
        const se = [ne[0], sw[1], z];
        return [sw, nw, ne, se];
    }

    getTileUrl = (tile: Tile) => {
        const { project } = this.props;
        const quadKey = tilebelt.tileToQuadkey(tile);
        // $FlowFixMe
        const url = project.tileServer.url
            .replace('{quad_key}', quadKey)
            // $FlowFixMe
            .replace('{key}', project.tileServer.apiKey);
        return url;
    }

    render = () => {
        const { task } = this.props;
        const zoomLevel = 19;
        if (task.geojson === undefined) {
            // data is not ready yet, just show a placeholder
            return (
                <View style={{
                    height: tileSize,
                    width: tileSize,
                }}
                />
            );
        }
        const coords = task.geojson.coordinates[0];
        const center = this.getBuildingCentroid(coords);
        // get 4 tiles at zoomLevel and shift them as needed
        const screenBBox = this.getScreenBBoxFromCenter(center, zoomLevel);
        const corners = this.BBOXToCoords(screenBBox);
        const swCornerTile = tilebelt.pointToTileFraction(corners[0][0], corners[0][1], zoomLevel);
        const tiles = this.getTilesFromScreenCorners(corners, zoomLevel);
        const tileUrls = tiles.map(this.getTileUrl);

        // build footprint polyline
        const p = this.getPolygon(coords, screenBBox);

        const shiftX = (swCornerTile[0] % 1) * tileSize;
        const shiftY = (swCornerTile[1] % 1) * tileSize;
        return (
            <View style={{
                height: tileSize,
                overflow: 'hidden',
                width: tileSize,
            }}
            >
                <View style={{
                    position: 'absolute',
                    left: -shiftX,
                    top: -(shiftY),
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
                    <Shape
                        d={p}
                        stroke="red"
                        strokeWidth={2}
                    />
                </Surface>
            </View>
        );
    }
}
