// @flow
import * as React from 'react';

import { Component } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';

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
    onPress: () => any,
    textStyle: Object,
    style: Object,
    testID?: string,
    isDisabled?: boolean,
};

class Button extends Component<Props> {
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
            }
        });
        return childElements;
    };

    render(): React.Node {
        const { onPress, style, textStyle, testID, isDisabled, children } =
            this.props;
        if (isDisabled === true) {
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
