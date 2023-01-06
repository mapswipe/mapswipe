// @flow
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type {
    ViewStyleProp,
    TextStyleProp,
} from 'react-native/Libraries/StyleSheet/StyleSheet';
import { SvgXml } from 'react-native-svg';

import type { Node } from 'react';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DARK_GRAY,
    FONT_SIZE_SMALL,
    SPACING_MEDIUM,
    SPACING_SMALL,
} from '../constants';

import { chevronRight } from './SvgIcons';

const styles = StyleSheet.create({
    clickableListItem: {
        backgroundColor: COLOR_WHITE,
        borderColor: COLOR_LIGHT_GRAY,
        borderBottomWidth: SPACING_SMALL,
    },

    clickableListItemContent: {
        display: 'flex',
        flexDirection: 'row',
        padding: SPACING_MEDIUM,
    },

    clickableListItemText: {
        flexGrow: 1,
        color: COLOR_DARK_GRAY,
    },

    clickableListItemIcon: {
        flexShrink: 0,
        opacity: 0.5,
        marginLeft: SPACING_MEDIUM,
    },
});

type ClickableListItemProps<N> = {
    name?: N,
    accessibilityLabel?: string,
    hideChevronIcon?: boolean,
    icon?: Node,
    onPress: (name?: N) => void,
    style?: ViewStyleProp,
    title: string,
    textStyle?: TextStyleProp,
};

function ClickableListItem<N = any>(props: ClickableListItemProps<N>): any {
    const {
        name,
        title,
        onPress,
        accessibilityLabel = title,
        style,
        icon,
        hideChevronIcon = false,
        textStyle,
    } = props;

    const handlePress = React.useCallback(() => {
        if (onPress) {
            onPress(name);
        }
    }, [onPress, name]);

    return (
        <Pressable
            onPress={handlePress}
            style={[styles.clickableListItem, style]}
        >
            <View
                style={styles.clickableListItemContent}
                accessible
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
            >
                <Text style={[styles.clickableListItemText, textStyle]}>
                    {title}
                </Text>
                {icon}
                {!hideChevronIcon && (
                    <SvgXml
                        style={styles.clickableListItemIcon}
                        height={FONT_SIZE_SMALL}
                        xml={chevronRight}
                    />
                )}
            </View>
        </Pressable>
    );
}

export default ClickableListItem;
