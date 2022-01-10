// @flow
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from 'apsl-react-native-button';
import { SvgXml } from 'react-native-svg';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../constants';
import GLOBAL from '../Globals';

const buttonMargin = GLOBAL.SCREEN_HEIGHT >= 550 ? 50 : 30;

const borderWidth = 5;

const styles = StyleSheet.create({
    icon: {
        alignSelf: 'center',
        marginBottom: -3,
        height: 25,
        width: 25,
    },
    whiteBold: {
        alignSelf: 'center',
        color: COLOR_WHITE,
        fontSize: 22,
        fontWeight: 'bold',
    },
});

type Props = {
    color: any,
    // the SVG icon to display in the button as a js string
    iconXmlString: string,
    label: string,
    // we don't need the boolean, but it stops eslint from complaining
    onPress: () => boolean,
    radius: number,
    selected: boolean,
};

/* eslint-disable global-require */
function RoundButtonWithTextBelow(props: Props) {
    const { color, iconXmlString, label, onPress, radius, selected } = props;
    return (
        <View
            style={{
                borderColor: selected ? COLOR_WHITE : COLOR_DEEP_BLUE,
                borderRadius: radius + borderWidth,
                borderWidth,
                height: radius + 2 * borderWidth,
                marginBottom: buttonMargin,
                marginTop: buttonMargin,
                width: radius + 2 * borderWidth,
            }}
        >
            <Button
                onPress={onPress}
                style={{
                    alignSelf: 'center',
                    backgroundColor: color,
                    borderColor: COLOR_DEEP_BLUE,
                    borderRadius: radius,
                    borderWidth: 1,
                    height: radius,
                    width: radius,
                }}
                textStyle={styles.whiteBold}
            >
                <View style={styles.icon}>
                    <SvgXml xml={iconXmlString} width="100%" height="100%" />
                </View>
            </Button>
            <Text
                style={{
                    alignSelf: 'center',
                    color: COLOR_WHITE,
                    fontWeight: selected ? 'bold' : 'normal',
                    fontSize: 12,
                }}
            >
                {label}
            </Text>
        </View>
    );
}
/* eslint-enable global-require */

export default (RoundButtonWithTextBelow: Props => React.Node);
