// @flow
import * as React from 'react';

import { Component } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import type {
    ViewStyleProp,
    TextStyleProp,
} from 'react-native/Libraries/StyleSheet/StyleSheet';

// loosely adapted from https://github.com/APSL/react-native-button
const styles = StyleSheet.create({
    button: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    opacity: {
        opacity: 0.5,
    },
});

type Props = {
    children: any,
    onPress: () => void,
    textStyle: TextStyleProp,
    style: ViewStyleProp,
    testID?: string,
    isDisabled?: boolean,
};
/**
 * A basic Button.
 * @param {function} onPress - behavior of the button on Press
 * @param {ViewStyleProp} textStyle - style to be used for the text in the button
 * @param {ViewStyleProp} style - visual style of the button
 * @param {string} [testID] - ID to identify the button in the Code
 * @param {boolean} [isDisabled] - disabled buttons are not clickable and are shown greyed out
 */
class Button extends Component<Props> {
    /**
     * Render only strings, numbers or other valid React items inside Button.
     */
    renderChildren: Function = (textStyle: Object, children: any) => {
        const childElements = [];
        React.Children.forEach(children, item => {
            if (typeof item === 'string' || typeof item === 'number') {
                const element = (
                    <Text style={[styles.text, textStyle]} key={item}>
                        {item}
                    </Text>
                );
                childElements.push(element);
            } else if (React.isValidElement(item)) {
                childElements.push(item);
            } else {
                console.log('Item passed to Button is not valid.');
            }
        });
        return childElements;
    };

    render(): React.Node {
        const { onPress, style, textStyle, testID, isDisabled, children } =
            this.props;
        if (isDisabled) {
            return (
                <View style={[styles.button, style, styles.opacity]}>
                    {this.renderChildren(textStyle, children)}
                </View>
            );
        }
        const extraAttributes = { testID };

        return (
            <Pressable
                style={[styles.button, style]}
                onPress={onPress}
                android_ripple={{ color: 'light-gray' }}
                {...extraAttributes}
            >
                {this.renderChildren(textStyle, children)}
            </Pressable>
        );
    }
}

export default Button;
