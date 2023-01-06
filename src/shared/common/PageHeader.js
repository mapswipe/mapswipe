// @flow
import React from 'react';
import type { Node } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import {
    COLOR_DEEP_BLUE,
    COLOR_WHITE,
    FONT_SIZE_LARGE,
    SPACING_LARGE,
    SPACING_MEDIUM,
} from '../constants';

import BackButton from './BackButton';

const styles = StyleSheet.create({
    pageHeader: {
        backgroundColor: COLOR_DEEP_BLUE,
        padding: SPACING_MEDIUM,
    },

    headingSection: {
        flexDirection: 'row',
    },

    heading: {
        color: COLOR_WHITE,
        fontSize: FONT_SIZE_LARGE,
    },

    description: {
        color: COLOR_WHITE,
    },

    textDescriptionSection: {
        marginTop: SPACING_MEDIUM,
    },

    descriptionNode: {
        marginTop: SPACING_MEDIUM,
    },

    backButton: {
        marginRight: SPACING_LARGE,
    },
});
interface Props {
    style?: ?ViewStyleProp;
    heading: string;
    description?: string;
    descriptionNode?: Node;
}

function PageHeader(props: Props): any {
    const { style, heading, description, descriptionNode } = props;

    return (
        <View style={[styles.pageHeader, style]}>
            <View style={styles.headingSection}>
                <BackButton style={styles.backButton} />
                <View>
                    <Text style={styles.heading}>{heading}</Text>
                </View>
            </View>
            {description && (
                <View style={styles.textDescriptionSection}>
                    <Text style={styles.description}>{description}</Text>
                </View>
            )}
            {descriptionNode && (
                <View style={styles.descriptionNode}>{description}</View>
            )}
        </View>
    );
}

export default PageHeader;
