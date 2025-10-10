// @flow
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Trans } from 'react-i18next';
import LoadingIcon from '../LoadingIcon';
import SatImage from '../../common/SatImage';
import { COLOR_DARK_GRAY, COLOR_LIGHT_GRAY } from '../../constants';

import type { ChangeDetectionTaskType, ResultType } from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    bottomImage: {
        // Adding a maxHeight to make sure that tiles fit
        // also on very long phones.
        alignItems: 'center',
        aspectRatio: 1,
        height: '49%',
        maxHeight: GLOBAL.SCREEN_WIDTH,
    },
    topImage: {
        alignItems: 'center',
        aspectRatio: 1,
        height: '49%',
        maxHeight: GLOBAL.SCREEN_WIDTH,
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
    onToggleTile: ResultType => void,
    // eslint-disable-next-line react/no-unused-prop-types
    submitResult: (number, string) => void,
    task: ChangeDetectionTaskType,
    closeTilePopup: () => void,
    openTilePopup: () => void,
    hideIcons: boolean,
    visibleAccessibility: boolean,
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

    // $FlowFixMe
    render = () => {
        const {
            onToggleTile,
            task,
            openTilePopup,
            closeTilePopup,
            hideIcons,
            visibleAccessibility,
        } = this.props;

        if (!task) {
            return <LoadingIcon label="Loading tasks" />;
        }

        if (task === undefined) {
            return <LoadingIcon label="Loading tasks" />;
        }

        return (
            <>
                <View
                    style={{
                        alignItems: 'center',
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingLeft: 5,
                        paddingRight: 5,
                        width: GLOBAL.SCREEN_WIDTH,
                    }}
                >
                    <SatImage
                        overlayText={
                            <Trans i18nKey="CDTaskScreen:before">Before</Trans>
                        }
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: task.url }}
                        style={styles.topImage}
                        task={task}
                        closeTilePopup={closeTilePopup}
                        openTilePopup={openTilePopup}
                        hideIcons={hideIcons}
                        visibleAccessibility={visibleAccessibility}
                    />
                    <SatImage
                        interactive
                        onToggleTile={onToggleTile}
                        overlayText={
                            <Trans i18nKey="CDTaskScreen:after">After</Trans>
                        }
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: task.urlB }}
                        style={styles.bottomImage}
                        task={task}
                        closeTilePopup={closeTilePopup}
                        openTilePopup={openTilePopup}
                        hideIcons={hideIcons}
                        visibleAccessibility={visibleAccessibility}
                    />
                </View>
            </>
        );
    };
}
