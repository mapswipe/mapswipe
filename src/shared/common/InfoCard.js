// @flow
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import {
    COLOR_WHITE,
    COLOR_DARK_GRAY,
    FONT_SIZE_SMALL,
    FONT_SIZE_EXTRA_LARGE,
    SPACING_MEDIUM,
    SPACING_SMALL,
    FONT_WEIGHT_BOLD,
} from '../constants';

const styles = StyleSheet.create({
    infoCard: {
        padding: SPACING_SMALL,
    },

    container: {
        flexGrow: 1,
        backgroundColor: COLOR_WHITE,
        padding: SPACING_MEDIUM,
    },
    titleSection: {
        display: 'flex',
        flexDirection: 'row',
    },
    title: {
        color: COLOR_DARK_GRAY,
        flexGrow: 1,
        flexShrink: 1,
    },
    icon: {
        flexShrink: 0,
        marginLeft: SPACING_SMALL,
    },
    valueContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    listValueContainer: {
        flexDirection: 'row',
        flexGrow: 1,
    },
    value: {
        fontWeight: FONT_WEIGHT_BOLD,
        fontSize: FONT_SIZE_EXTRA_LARGE,
    },
    unit: {
        lineHeight: FONT_SIZE_EXTRA_LARGE,
        marginLeft: SPACING_SMALL * 0.5,
    },
    gap: {
        height: SPACING_MEDIUM,
    },
    horizontalGap: {
        width: SPACING_MEDIUM,
    },
    segment: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
});

type Props = {
    title: string,
    value: string | Array<{ value: string, unit: string }>,
    style?: ViewStyleProp,
    iconXml?: string,
};

function InfoCard(props: Props) {
    const { title, value, style, iconXml } = props;

    return (
        <View style={[styles.infoCard, style]}>
            <View style={styles.container}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{title}</Text>
                    {iconXml && (
                        <SvgXml
                            style={styles.icon}
                            height={FONT_SIZE_SMALL}
                            xml={iconXml}
                        />
                    )}
                </View>
                <View style={styles.gap} />
                {typeof value === 'string' && (
                    <View style={styles.valueContainer}>
                        <Text style={styles.value}>{value}</Text>
                    </View>
                )}
                {Array.isArray(value) && (
                    <View style={styles.listValueContainer}>
                        {value.map((seg, i) => (
                            <>
                                <View style={styles.segment}>
                                    <Text style={styles.value}>
                                        {seg.value}
                                    </Text>
                                    <Text style={styles.unit}>{seg.unit}</Text>
                                </View>
                                {i < value.length && (
                                    <View style={styles.horizontalGap} />
                                )}
                            </>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

export default (InfoCard: any);
