// @flow
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path, Text } from 'react-native-svg';

import GLOBAL from '../Globals';

type Props = {
    // whether to shift the scale bar a little bit up from the bottom
    alignToBottom: boolean,
    latitude: number,
    position: 'bottom' | 'top',
    // the width of a TMS tile in screen pixels. eg. if an imagery tile is the same
    // width as the screen, then this is GLOBAL.SCREEN_WIDTH
    referenceSize: number,
    visible: boolean,
    zoomLevel: number,
};

const getScaleBar = (
    meters,
    feet,
    tileWidthInMeters,
    referenceSize,
): string => {
    /*
     * produce a shape like
     * |       |
     * --------------
     * |            |
     */
    const top = 0;
    const mid = 16;
    // convert meters and feet into "pixels" so that we draw at the correct scale!
    const metersPx = (meters / tileWidthInMeters) * referenceSize;
    const feetPx = (feet / tileWidthInMeters) * referenceSize;
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
    const {
        alignToBottom,
        latitude,
        position,
        referenceSize,
        // useScreenWidth,
        visible,
        zoomLevel,
    } = props;

    // calculate the width of one tile (in meters)
    // this magic formula comes from
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    // This assumes that each image is 256 pixels wide, which may not be
    // the case for specific providers. Adjustments might be needed if
    // this case arises.
    const tileWidthInMeters =
        (Math.cos(latitude * (Math.PI / 180)) * 2 * Math.PI * 6378137) /
        2 ** zoomLevel;
    let feet;
    let meters;
    // calculate scalebar size so that it fits in roughly half the image
    // display width, while using a rough step function. This may give
    // somewhat strange results in high latitudes where the rounding
    // will not look nice.
    if (tileWidthInMeters < 200) {
        meters = Math.trunc(tileWidthInMeters / 10 / 2) * 10;
        feet = Math.round(meters / 0.3048 / 100) * 100;
    } else {
        meters = Math.trunc(tileWidthInMeters / 100 / 2) * 100;
        feet = Math.round(meters / 0.3048 / 100) * 100;
    }

    const p = getScaleBar(meters, feet, tileWidthInMeters, referenceSize);
    return (
        <View
            style={[
                {
                    opacity: visible ? 0.5 : 0,
                    position: 'absolute',
                    left: 10,
                },
                {
                    bottom:
                        // eslint-disable-next-line no-nested-ternary
                        position === 'bottom'
                            ? alignToBottom
                                ? 0
                                : 20
                            : undefined,
                    top: position === 'top' ? 20 : undefined,
                },
            ]}
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
