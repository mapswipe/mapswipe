// @flow
import * as React from 'react';
import {
    ART,
    View,
} from 'react-native';
import GLOBAL from '../Globals';

const {
    Path,
    Shape,
    Surface,
    Text,
} = ART;

type Props = {
    latitude: number,
    visible: boolean,
    zoomLevel: number,
};

const getScaleBar = (meters, feet, tileWidth) => {
    /*
     * produce a shape like
     * |       |
     * --------------
     * |            |
     */
    const top = 0;
    const mid = 16;
    // convert meters and feet into "pixels" so that we draw at the correct scale!
    const metersPx = meters / (tileWidth * GLOBAL.TILE_SIZE);
    const feetPx = feet / (tileWidth * GLOBAL.TILE_SIZE);
    const bottom = top + 2 * (mid - top);
    const p = Path().moveTo(0, top);
    p.lineTo(0, bottom);
    p.moveTo(0, mid);
    p.lineTo(metersPx, mid);
    p.lineTo(metersPx, top);
    p.moveTo(metersPx, mid);
    p.lineTo(feetPx * 0.3048, mid);
    p.lineTo(feetPx * 0.3048, bottom);
    return p;
};

export default (props: Props) => {
    const { latitude, visible, zoomLevel } = props;

    // calculate the width of one tile (in meters)
    // this magic formula comes from
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    const tileWidth = (Math.cos(latitude * (Math.PI / 180))
        * 2 * Math.PI * 6378137) / ((256 * (2 ** zoomLevel)) * 256);
    let feet;
    let meters;
    // we hardcode the scale bar sizes, and pick an appropriate one
    // for the current zoom level
    switch (true) {
    case (tileWidth < 70):
        meters = 30;
        feet = 100;
        break;
    case (tileWidth < 110):
        meters = 50;
        feet = 200;
        break;
    case (tileWidth < 180):
        meters = 100;
        feet = 300;
        break;
    default:
        meters = 200;
        feet = 500;
        break;
    }

    const p = getScaleBar(meters, feet, tileWidth);
    return (
        <View style={{
            height: GLOBAL.TILE_SIZE / 5,
            width: GLOBAL.TILE_SIZE,
            opacity: (visible ? 0.8 : 0),
            position: 'absolute',
            bottom: 20,
            left: 10,
        }}
        >
            <Surface
                height={GLOBAL.TILE_SIZE / 5}
                width={GLOBAL.TILE_SIZE}
            >
                <Shape
                    d={p}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={1}
                />
                <Text
                    alignment="left"
                    fill="rgba(255, 255, 255, 0.6)"
                    font={{
                        fontFamily: 'Helvetica, Arial',
                        fontSize: 13,
                    }}
                    x={3}
                    y={0}
                >
                    {`${meters}m`}
                </Text>
                <Text
                    alignment="left"
                    fill="rgba(255, 255, 255, 0.6)"
                    font={{
                        fontFamily: 'Helvetica, Arial',
                        fontSize: 13,
                    }}
                    x={3}
                    y={17}
                >
                    {`${feet}ft`}
                </Text>
            </Surface>
        </View>
    );
};
