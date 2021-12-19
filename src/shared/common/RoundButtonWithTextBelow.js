// @flow
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
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
    // we don't need the boolean, but it stops eslint from complaining
    onPress: () => boolean,
    radius: number,
    selected: boolean,
};

/* eslint-disable global-require, react/destructuring-assignment */
function RoundButtonWithTextBelow(props: Props) {
    return (
        <View
            style={{
                borderColor: props.selected ? COLOR_WHITE : COLOR_DEEP_BLUE,
                borderRadius: props.radius + borderWidth,
                borderWidth,
                height: props.radius + 2 * borderWidth,
                marginBottom: buttonMargin,
                marginTop: buttonMargin,
                width: props.radius + 2 * borderWidth,
            }}
        >
            <Button
                onPress={props.onPress}
                style={{
                    alignSelf: 'center',
                    backgroundColor: props.color,
                    borderColor: COLOR_DEEP_BLUE,
                    borderRadius: props.radius,
                    borderWidth: 1,
                    height: props.radius,
                    width: props.radius,
                }}
                textStyle={styles.whiteBold}
            >
                <View style={styles.icon}>
                    <SvgXml
                        xml={props.iconXmlString}
                        width="100%"
                        height="100%"
                    />
                </View>
            </Button>
        </View>
    );
}
/* eslint-enable global-require, react/destructuring-assignment */

export default (RoundButtonWithTextBelow: Props => React.Node);
