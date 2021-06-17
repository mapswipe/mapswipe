// @flow
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import LoadingIcon from '../LoadingIcon';
import SatImage from '../../common/SatImage';
import ScaleBar from '../../common/ScaleBar';
import { COLOR_DARK_GRAY, COLOR_LIGHT_GRAY } from '../../constants';

import type { ChangeDetectionTaskType, ResultType } from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    bottomImage: {
        // this style might break on very elongated screens
        // with aspect ratio higher than 16:9, where the images
        // might be cropped on the sides (as of writing this,
        // only a couple of phones fall into that group, so we
        // ignore them for now)
        // see https://stackoverflow.com/a/23009368/1138710
        alignItems: 'center',
        aspectRatio: 1,
        height: '49%',
    },
    topImage: {
        alignItems: 'center',
        aspectRatio: 1,
        height: '49%',
    },
    overlayText: {
        color: COLOR_LIGHT_GRAY,
        fontSize: 15,
        paddingLeft: 5,
        textShadowColor: COLOR_DARK_GRAY,
        textShadowRadius: 30,
    },
});

// result codes to be sent back to backend
const minSwipeLength = 0.2;
const swipeToSizeRatio = 2;

type Props = {
    //commitCompletedGroup: () => void,
    index: number,
    onToggleTile: (ResultType) => void,
    task: ChangeDetectionTaskType,
    closeTilePopup: () => void,
    openTilePopup: () => void,
    zoomLevel: number,
};

// see https://zhenyong.github.io/flowtype/blog/2015/11/09/Generators.html
type taskGenType = Generator<string, void, void>;

export default class ChangeDetectionTask extends React.PureComponent<Props> {
    imageSize: number;

    lockedSize: number;

    swipeThreshold: number;

    taskGen: taskGenType;

    tasksDone: number;

    constructor(props: Props) {
        super(props);
        this.tasksDone = 0;
        this.imageSize = 250;
        this.swipeThreshold = this.imageSize * minSwipeLength;
        this.lockedSize = this.swipeThreshold * swipeToSizeRatio;
    }

    render = () => {
        const {
            index,
            onToggleTile,
            task,
            openTilePopup,
            closeTilePopup,
            zoomLevel
        } = this.props;
        if (!task) {
            return <LoadingIcon />;
        }

        if (task === undefined) {
            return <LoadingIcon />;
        }

        // calculate the latitude of the top row of the group for the scalebar
        // see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        // lat_rad = arctan(sinh(π * (1 - 2 * ytile / n)))
        // lat_deg = lat_rad * 180.0 / π
        const latitude =
            Math.atan(
                Math.sinh(Math.PI * (1 - (2 * task.taskY) / 2 ** zoomLevel)),
            ) *
            (180 / Math.PI);

        console.log(latitude)

        return (
            <>
                <View
                    style={{
                        alignItems: 'center',
                        flex: 1,
                        marginLeft: index === 0 ? GLOBAL.SCREEN_WIDTH * 0.1 : 0,
                        flexGrow: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingLeft: 5,
                        paddingRight: 5,
                        width: GLOBAL.SCREEN_WIDTH * 0.8,
                    }}
                >
                    <SatImage
                        overlayText="Before"
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: task.url }}
                        style={styles.topImage}
                        task={task}
                        closeTilePopup={closeTilePopup}
                        openTilePopup={openTilePopup}
                    />
                    <SatImage
                        interactive
                        onToggleTile={onToggleTile}
                        overlayText="After"
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: task.urlB }}
                        style={styles.bottomImage}
                        task={task}
                        closeTilePopup={closeTilePopup}
                        openTilePopup={openTilePopup}
                    />
                    <ScaleBar
                        alignToBottom={false}
                        latitude={latitude}
                        useScreenWidth={false}
                        visible={true}
                        zoomLevel={zoomLevel}
                    />
                </View>
            </>
        );
    };
}
