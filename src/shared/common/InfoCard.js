// @flow
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { COLOR_WHITE, COLOR_DARK_GRAY } from '../constants';

const styles = StyleSheet.create({
    infoCard: {
        padding: 5,
    },
    container: {
        backgroundColor: COLOR_WHITE,
        padding: 20,
    },
    title: {
        color: COLOR_DARK_GRAY,
    },
    value: {
        fontWeight: 'bold',
        fontSize: 30,
    },
    gap: {
        height: 10,
    },
});

type Props = {
    title: string,
    value: string,
    style?: ViewStyleProp,
};

function InfoCard(props: Props) {
    const { title, value, style } = props;

    return (
        <View style={[styles.infoCard, style]}>
            <View style={[styles.container]}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.gap} />
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
}

export default (InfoCard: any);
