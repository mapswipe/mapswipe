// @flow
import * as React from 'react';
import ProgressBar from 'react-native-progress/Bar';
import { StyleSheet, View } from 'react-native';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
} from '../constants';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    swipeNavBottom: {
        width: GLOBAL.SCREEN_WIDTH,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: COLOR_DEEP_BLUE,
    },
});

type BPState = {
    progress: number,
};

export default class BottomProgress extends React.Component<{}, BPState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            progress: 0,
        };
    }

    updateProgress: (progress: number) => void = (progress: number) => {
        //console.log('update PB', progress);
        this.setState({
            progress,
        });
    };

    render(): React.Node {
        const { progress } = this.state;
        return (
            <View style={styles.swipeNavBottom}>
                <ProgressBar
                    animated={false}
                    height={3}
                    width={GLOBAL.SCREEN_WIDTH * 0.98}
                    marginBottom={2}
                    borderRadius={2}
                    unfilledColor={COLOR_DARK_GRAY}
                    color={COLOR_LIGHT_GRAY}
                    borderColor={COLOR_DEEP_BLUE}
                    progress={progress}
                />
            </View>
        );
    }
}
