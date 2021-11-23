// @flow
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path, Text } from 'react-native-svg';

import GLOBAL from '../Globals';

type Props = {
    // whether to shift the scale bar a little bit up from the bottom
    alignToBottom: boolean,
    latitude: number,
    // true if we should use the screen_width to size the scale bar instead of
    // using the tile size. This is useful for building footprint projects
    // with TMS imagery as we use a few tricks there to cover the entire screen
    // with imagery
    useScreenWidth: boolean,
    visible: boolean,
    zoomLevel: number,
};

const getScaleBar = (meters, feet, tileWidth, referenceSize): string => {
    /*
     * produce a shape like
     * |       |
     * --------------
     * |            |
     */
    const top = 0;
    const mid = 16;
    // convert meters and feet into "pixels" so that we draw at the correct scale!
    const metersPx = (meters / tileWidth) * referenceSize;
    const feetPx = (feet / tileWidth) * referenceSize;
    const bottom = top + 2 * (mid - top);
    const parts = [
        `M0 ${top}`,
        `L0 ${bottom}`,
        `M0 ${mid}`,
        `L${metersPx} ${mid}`,
        `L${metersPx} ${top}`,
        `M${metersPx} ${mid}`,
        `L${feetPx * 0.3048} ${mid}`,
        `L${feetPx * 0.3048} ${bottom}`,
    ];
    const p = parts.join(' ');
    return p;
};

export default (props: Props): React.Node => {
    const { alignToBottom, latitude, useScreenWidth, visible, zoomLevel } =
        props;

    // calculate the width of one tile (in meters)
    // this magic formula comes from
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    // This assumes that each image is 256 pixels wide, which may not be
    // the case for specific providers. Adjustments might be needed if
    // this case arises.
    const tileWidth =
        (Math.cos(latitude * (Math.PI / 180)) * 2 * Math.PI * 6378137) /
        2 ** zoomLevel;
    let feet;
    let meters;
    // we hardcode the scale bar sizes, and pick an appropriate one
    // for the current zoom level
    switch (true) {
        case tileWidth < 70:
            meters = 30;
            feet = 100;
            break;
        case tileWidth < 110:
            meters = 50;
            feet = 200;
            break;
        case tileWidth < 180:
            meters = 100;
            feet = 300;
            break;
        default:
            meters = 200;
            feet = 500;
            break;
    }

    const referenceSize = useScreenWidth
        ? GLOBAL.SCREEN_WIDTH
        : GLOBAL.TILE_SIZE;
    const p = getScaleBar(meters, feet, tileWidth, referenceSize);
    return (
        <View
            style={{
                opacity: visible ? 0.5 : 0,
                position: 'absolute',
                bottom: alignToBottom ? 0 : 20,
                left: 10,
            }}
        >
            <Svg height={GLOBAL.TILE_SIZE / 5} width={referenceSize}>
                <Path d={p} stroke="white" strokeWidth={1} />
                <Text
                    alignment="left"
                    fill="white"
                    font={{
                        fontFamily: 'Helvetica, Arial',
                        fontSize: 13,
                    }}
                    x="3"
                    y="13"
                >
                    {`${meters}m`}
                </Text>
                <Text
                    alignment="left"
                    fill="white"
                    font={{
                        fontFamily: 'Helvetica, Arial',
                        fontSize: 13,
                    }}
                    x="3"
                    y="30"
                >
                    {`${feet}ft`}
                </Text>
            </Svg>
        </View>
    );
};
