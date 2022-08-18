// @flow
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import {
    COLOR_SUCCESS_GREEN,
    COLOR_LIGHT_GRAY,
    SPACING_MEDIUM,
} from '../constants';

const styles = StyleSheet.create({
    calendarHeatmap: {
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        display: 'flex',
        flexDirection: 'row',
    },

    emptyText: {
        opacity: 0.5,
    },

    item: {
        backgroundColor: COLOR_SUCCESS_GREEN,
        borderWidth: 3,
        borderColor: COLOR_LIGHT_GRAY,
    },

    break: {
        width: '100%',
    },
});

type Props = {
    style: ViewStyleProp,
    data: Object[],
};

function CalendarHeatmap(props: Props) {
    const { style, data } = props;

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = Math.min((screenWidth - SPACING_MEDIUM * 2 - 1) / 7, 40);

    return (
        <View style={[styles.calendarHeatmap, style]}>
            {(!data || data.length) < 5 && (
                <Text style={styles.emptyText}>
                    Not enough data to display heatmap
                </Text>
            )}
            {data.map(datum => (
                <React.Fragment key={datum.key}>
                    {datum.key > 0 && datum.key % 7 === 0 && (
                        <View style={styles.break} />
                    )}
                    <View
                        style={[
                            styles.item,
                            {
                                width: itemWidth,
                                height: itemWidth,
                            },
                        ]}
                    >
                        <View
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: (1 - datum.value) * 0.95,
                                backgroundColor: COLOR_LIGHT_GRAY,
                            }}
                        />
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
}

export default (CalendarHeatmap: any);
