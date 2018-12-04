import * as React from 'react';
import {
    ART,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import tilebelt from '@mapbox/tilebelt';

const GLOBAL = require('../../Globals');

const tileSize = GLOBAL.SCREEN_WIDTH / 2;

const styles = StyleSheet.create({
    mapContainer: {
    },
    polygonOverlay: {
        height: 256,
        width: 256,
    },
    tileImg: {
        borderColor: 'white',
        borderWidth: 0.5,
        height: tileSize,
        width: tileSize,
    },
    whiteText: {
        color: 'white',
    },
});

export default class FootprintDisplay extends React.Component {
    /*
     * Get the polygon to draw over the image
     */
    getPolygon = (coords, screenBBox) => {
        const [minLon, minLat, maxLon, maxLat] = screenBBox;
        const lon2x = lon => ((lon - minLon) / (maxLon - minLon)) * tileSize * 2;
        const lat2y = lat => (1 - (lat - minLat) / (maxLat - minLat)) * tileSize * 2;
        const p = ART.Path().moveTo(lon2x(coords[0][0]), lat2y(coords[0][1]));
        coords.forEach((corner) => {
            p.lineTo(lon2x(corner[0]), lat2y(corner[1]));
        });
        p.close();
        return p;
    }

    /*
     * Get the building bounding box (in real coordinates)
     */
    getBuildingBBox = (coords) => {
        const lons = coords.map(p => p[0]).sort();
        const lats = coords.map(p => p[1]).sort();
        return [lons[0], lats[0], lons[lons.length - 1], lats[lats.length - 1]];
    }

    render = () => {
        const { project, task } = this.props;
        // drop the last point, as it's the same as the first one
        const coords = task.geojson.coordinates[0];
        const footprintBBox = this.getBuildingBBox(coords);
        let parentTile = tilebelt.bboxToTile(footprintBBox);
        console.log('parentTile', coords, footprintBBox, parentTile);
        while (parentTile[2] > 18) {
            // force a max zoom of 18, as there is no imagery beyond that
            parentTile = tilebelt.getParent(parentTile);
        }
        const tiles = tilebelt.getChildren(parentTile);
        const quadKeys = tiles.map(tilebelt.tileToQuadkey);
        const tileUrls = quadKeys.map(quadKey => project.info.tileserver_url
            .replace('{quad_key}', quadKey)
            .replace('{key}', project.info.api_key));
        // build footprint polyline
        const screenBBox = tilebelt.tileToBBOX(parentTile);
        console.log('IMG', tiles, screenBBox);
        const p = this.getPolygon(coords, screenBBox);
        console.log('polygon', p, coords);

        return (
            <View style={styles.mapContainer}>
                <Image
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            left: 0,
                            top: 0,
                        },
                        styles.tileImg,
                    ]}
                    source={{ uri: tileUrls[0] }}
                />
                <Image
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            left: tileSize,
                            top: 0,
                        },
                        styles.tileImg,
                    ]}
                    source={{ uri: tileUrls[1] }}
                />
                <Image
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            left: 0,
                            top: tileSize,
                        },
                        styles.tileImg,
                    ]}
                    source={{ uri: tileUrls[3] }}
                />
                <Image
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            left: tileSize,
                            top: tileSize,
                        },
                        styles.tileImg,
                    ]}
                    source={{ uri: tileUrls[2] }}
                />
                <ART.Surface
                    height={GLOBAL.SCREEN_WIDTH}
                    width={GLOBAL.SCREEN_WIDTH}
                >
                    <ART.Shape
                        d={p}
                        stroke="red"
                        strokeWidth={2}
                    />
                </ART.Surface>
                <Text style={styles.whiteText}>
                    {`Task ${task.id} - tile ${parentTile}`}
                </Text>
            </View>
        );
    }
}
