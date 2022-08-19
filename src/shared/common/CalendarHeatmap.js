// @flow
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import {
    COLOR_LIGHT_GRAY,
    SPACING_MEDIUM,
    COLOR_CALENDAR_GRAPH_DAY_L1,
    COLOR_CALENDAR_GRAPH_DAY_L2,
    COLOR_CALENDAR_GRAPH_DAY_L3,
    COLOR_CALENDAR_GRAPH_DAY_L4,
    COLOR_CALENDAR_GRAPH_BACKGROUND,
    COLOR_CALENDAR_GRAPH_BORDER,
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

    dayList: {
        flexDirection: 'row',
    },

    item: {
        borderWidth: 5,
        borderColor: COLOR_LIGHT_GRAY,
    },

    break: {
        width: '100%',
    },
});

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
    style: ViewStyleProp,
    data: Object,
};

function CalendarHeatmap(props: Props) {
    const { style, data } = props;

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = Math.min((screenWidth - SPACING_MEDIUM * 2 - 1) / 7, 36);

    const now = new Date();
    const dayOfWeek = now.getDay();

    const endDate = new Date(now.getTime());
    endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

    const startDate = new Date(endDate.getTime());
    startDate.setDate(startDate.getDate() - 34);

    const dateKeys = Array.from(new Array(35).keys()).map(() => {
        const yyyy = startDate.getFullYear();
        const mm = String(startDate.getMonth() + 1).padStart(2, '0');
        const dd = String(startDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        startDate.setDate(startDate.getDate() + 1);
        return dateKey;
    });

    return (
        <View style={[styles.calendarHeatmap, style]}>
            {(!data || data.length) < 5 && (
                <Text style={styles.emptyText}>
                    Not enough data to display heatmap
                </Text>
            )}
            <View style={styles.dayList}>
                {Array.from(new Array(7).keys()).map(key => {
                    const day = daysOfWeek[key];

                    return (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                width: itemWidth,
                            }}
                        >
                            <Text>{day}</Text>
                        </View>
                    );
                })}
            </View>
            <View style={styles.break} />
            {dateKeys.map((dateKey, index) => {
                const value = data[dateKey] ?? 0;
                let color = COLOR_CALENDAR_GRAPH_BACKGROUND;

                if (value > 0.1 && value < 0.25) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L1;
                }

                if (value >= 0.25 && value < 0.5) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L2;
                }

                if (value >= 0.5 && value < 0.75) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L3;
                }

                if (value >= 0.75) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L4;
                }

                return (
                    <React.Fragment key={dateKey}>
                        {index > 0 && index % 7 === 0 && (
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
                                    backgroundColor: color,
                                    borderColor:
                                        COLOR_CALENDAR_GRAPH_BACKGROUND,
                                    borderWidth: 1,
                                    borderRadius: 5,
                                }}
                            />
                        </View>
                    </React.Fragment>
                );
            })}
        </View>
    );
}

export default (CalendarHeatmap: any);
