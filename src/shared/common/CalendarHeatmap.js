// @flow
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { COLOR_SUCCESS_GREEN } from '../constants';

const styles = StyleSheet.create({
    calendarHeatmap: {
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        backgroundColor: COLOR_SUCCESS_GREEN,
        height: '32%',
        width: '9%',
        margin: 1,
    },
});

type Props = {
    style: ViewStyleProp,
};

function CalendarHeatmap(props: Props) {
    const { style } = props;
    return (
        <View style={[styles.calendarHeatmap, style]}>
            {Array.from(Array(30).keys()).map(value => (
                <View style={styles.item} key={value} />
            ))}
        </View>
    );
}

export default (CalendarHeatmap: any);
