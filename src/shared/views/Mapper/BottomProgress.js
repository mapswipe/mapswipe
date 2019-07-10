// @flow
import * as React from 'react';
import * as Progress from 'react-native-progress';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
} from '../../constants';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    progressBarText: {
        color: COLOR_LIGHT_GRAY,
        borderColor: '#212121',
        fontWeight: '500',
        position: 'absolute',
        top: 1,
        left: GLOBAL.SCREEN_WIDTH - 160,
        backgroundColor: 'transparent',
    },
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
    text: string,
};

export default class BottomProgress extends React.Component<{}, BPState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            progress: 0,
            text: 'START MAPPING',
        };
    }

    updateProgress = (progress: number) => {
        this.setState({
            progress,
            text: `YOU'VE MAPPED ${Math.ceil(progress * 100)}%`,
        });
    }

    render() {
        const { progress, text } = this.state;
        return (
            <View style={styles.swipeNavBottom}>
                <Progress.Bar
                    animated={false}
                    height={20}
                    width={GLOBAL.SCREEN_WIDTH * 0.98}
                    marginBottom={2}
                    borderRadius={0}
                    unfilledColor="#ffffff"
                    progress={progress}
                />
                <Text style={styles.progressBarText}>{text}</Text>
            </View>
        );
    }
}
