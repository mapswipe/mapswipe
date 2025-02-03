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
    FONT_SIZE_EXTRA_SMALL,
    FONT_WEIGHT_BOLD,
    COLOR_DEEP_BLUE,
} from '../constants';

const styles = StyleSheet.create({
    calendarHeatmap: {
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        display: 'flex',
        flexDirection: 'row',
    },

    dayList: {
        flexDirection: 'row',
    },

    item: {
        borderWidth: 2,
        borderColor: COLOR_LIGHT_GRAY,
    },

    break: {
        width: '100%',
    },
});

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDateSafe(value: string | number | Date) {
    if (typeof value === 'string') {
        return new Date(`${value}T00:00`);
    }

    return new Date(value);
}

function modifyDate(date: Date, modifier: (input: Date) => Date) {
    let safeDate = new Date(date);
    safeDate.setHours(12, 0, 0, 0);

    safeDate = modifier(safeDate);

    safeDate.setHours(0, 0, 0, 0);
    return safeDate;
}

function resolveTime(
    date: string | number | Date,
    resolution: 'day' | 'month' | 'year',
) {
    let newDate = getDateSafe(date);

    if (resolution === 'year') {
        newDate = modifyDate(newDate, d => {
            d.setMonth(0);
            return d;
        });
        newDate = modifyDate(newDate, d => {
            d.setDate(1);
            return d;
        });
    } else if (resolution === 'month') {
        newDate = modifyDate(newDate, d => {
            d.setDate(1);
            return d;
        });
    } else {
        newDate = modifyDate(newDate, d => d);
    }
    return newDate;
}

function incrementDate(
    date: Date,
    increment: number,
    res: 'day' | 'month' | 'year',
) {
    let myDate = new Date(date);
    if (res === 'year') {
        myDate = modifyDate(myDate, d => {
            d.setFullYear(d.getFullYear() + increment);
            return d;
        });
    } else if (res === 'month') {
        myDate = modifyDate(myDate, d => {
            d.setMonth(d.getMonth() + increment);
            return d;
        });
    } else {
        myDate = modifyDate(myDate, d => {
            d.setDate(d.getDate() + increment);
            return d;
        });
    }
    return myDate;
}

function getTimestamps(
    startDate: string | number | Date,
    endDate: string | number | Date,
    resolution: 'day' | 'month' | 'year',
) {
    const sanitizedStartDate = resolveTime(startDate, resolution);
    const sanitizedEndDate = resolveTime(endDate, resolution);

    const timestamps: number[] = [];
    for (
        let myDate = sanitizedStartDate, increment = 0;
        myDate <= sanitizedEndDate;
        increment += 1,
            myDate = incrementDate(sanitizedStartDate, increment, resolution)
    ) {
        timestamps.push(myDate.getTime());
    }

    return timestamps;
}

function getYmdString(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

type Props = {
    style: ViewStyleProp,
    data: Object,
};

function CalendarHeatmap(props: Props) {
    const { style, data } = props;

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = Math.min((screenWidth - SPACING_MEDIUM * 2 - 1) / 7, 38);

    const now = new Date();
    const dayOfWeek = now.getDay();

    // End date is the last day of the week
    let endDate = new Date(now);
    endDate = modifyDate(endDate, d => {
        d.setDate(d.getDate() + (6 - dayOfWeek));
        return d;
    });

    // Start date is 5 weeks ahead of end date
    let startDate = new Date(endDate);
    startDate = modifyDate(startDate, d => {
        d.setDate(d.getDate() - 7 * 5 + 1);
        return d;
    });

    const timestamps = getTimestamps(startDate, endDate, 'day');

    const maxValue = Math.max(
        1,
        ...timestamps.map(
            timestamp => data[getYmdString(new Date(timestamp))] ?? 0,
        ),
    );

    const timestampWithValues = timestamps.map(timestamp => ({
        key: timestamp,
        value: (data[getYmdString(new Date(timestamp))] ?? 0) / maxValue,
    }));

    return (
        <View style={[styles.calendarHeatmap, style]}>
            <View style={styles.dayList}>
                {daysOfWeek.map(day => (
                    <View
                        key={day}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: itemWidth,
                            opacity: 0.5,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: FONT_SIZE_EXTRA_SMALL,
                                fontWeight: FONT_WEIGHT_BOLD,
                            }}
                        >
                            {day}
                        </Text>
                    </View>
                ))}
            </View>
            <View style={styles.break} />
            {timestampWithValues.map(({ key, value }, index) => {
                let color;
                let opacity = 1;

                if (value <= 0) {
                    color = COLOR_CALENDAR_GRAPH_BACKGROUND;
                    opacity = 1;
                } else if (value < 0.25) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L1;
                    opacity = 0.5 + (value / 0.25 - 0.5);
                } else if (value < 0.5) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L2;
                    opacity = 0.5 + (value / 0.5 - 0.5);
                } else if (value < 0.75) {
                    color = COLOR_CALENDAR_GRAPH_DAY_L3;
                    opacity = 0.5 + (value / 0.75 - 0.5);
                } else {
                    color = COLOR_CALENDAR_GRAPH_DAY_L4;
                    opacity = value;
                }

                return (
                    <React.Fragment key={key}>
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
                                    borderColor:
                                        key === now.getTime()
                                            ? COLOR_DEEP_BLUE
                                            : COLOR_CALENDAR_GRAPH_BORDER,
                                    borderWidth: 2,
                                    borderRadius: 5,
                                }}
                            >
                                <View
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: color,
                                        opacity,
                                        borderRadius: 4,
                                    }}
                                />
                            </View>
                        </View>
                    </React.Fragment>
                );
            })}
        </View>
    );
}

export default (CalendarHeatmap: any);
