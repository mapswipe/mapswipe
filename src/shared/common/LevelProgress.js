// @flow
/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_WHITE,
} from '../constants';
import GLOBAL from '../Globals';

const styles = StyleSheet.create({
    barRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 0.5,
        borderBottomWidth: 0,
        borderColor: COLOR_LIGHT_GRAY,
        borderWidth: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    text: {
        color: COLOR_WHITE,
        borderColor: COLOR_DARK_GRAY,
        fontWeight: '500',
        position: 'absolute',
        width: GLOBAL.SCREEN_WIDTH,
        left: 0,
        textAlign: 'center',
        paddingTop: 5,
    },
});

type LPProps = {
    progress: number,
    text: string,
};

// LevelProgress
export default (props: LPProps): React.Node => {
    const { progress, text } = props;
    return (
        <View style={styles.barRow}>
            <Progress.Bar
                borderRadius={0}
                borderWidth={0}
                color={COLOR_DEEP_BLUE}
                height={30}
                progress={Number.isNaN(progress) ? 0 : progress}
                unfilledColor="#bbbbbb"
                width={GLOBAL.SCREEN_WIDTH}
            />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};
