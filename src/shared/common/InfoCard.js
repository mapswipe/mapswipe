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
        padding: 5,
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
    value: {
        fontWeight: FONT_WEIGHT_BOLD,
        fontSize: FONT_SIZE_EXTRA_LARGE,
    },
    gap: {
        height: SPACING_MEDIUM,
    },
});

type Props = {
    title: string,
    value: string,
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
                <View style={styles.valueContainer}>
                    <Text style={styles.value}>{value}</Text>
                </View>
            </View>
        </View>
    );
}

export default (InfoCard: any);
