// @flow
import * as React from 'react';
import * as Progress from 'react-native-progress';
import {
    StyleSheet,
    View,
} from 'react-native';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
} from '../constants';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    swipeNavBottom: {
        width: (GLOBAL.SCREEN_WIDTH),
        bottom: 3,
        position: 'absolute',
        left: 0,
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

    updateProgress = (progress: number) => {
        this.setState({
            progress,
        });
    }

    render() {
        const { progress } = this.state;
        return (
            <View style={styles.swipeNavBottom}>
                <Progress.Bar
                    animated={false}
                    height={20}
                    width={GLOBAL.SCREEN_WIDTH * 0.98}
                    marginBottom={2}
                    borderRadius={0}
                    unfilledColor={COLOR_LIGHT_GRAY}
                    progress={progress}
                />
            </View>
        );
    }
}
