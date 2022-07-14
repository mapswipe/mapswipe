// @flow
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { COLOR_WHITE, COLOR_DARK_GRAY } from '../constants';

const styles = StyleSheet.create({
    background: {
        backgroundColor: COLOR_WHITE,
    },
    title: {
        color: COLOR_DARK_GRAY,
    },
    value: {
        fontWeight: 'bold',
        fontSize: 30,
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
        <View style={[styles.background, style]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

export default (InfoCard: any);
