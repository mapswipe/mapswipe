// @flow
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    COLOR_BLACK,
    COLOR_SUCCESS_GREEN,
    COLOR_WHITE,
    tutorialModes,
} from '../../constants';
import { type TutorialContent } from '../../flow-types';
import {
    TickGreenOnWhite,
    NumberedTapIconBlack1,
    NumberedTapIconBlack2,
    NumberedTapIconBlack3,
    SwipeIconBlack,
    TapIconBlack,
} from './icons';

const styles = StyleSheet.create({
    box: {
        borderRadius: 10,
        left: '5%',
        opacity: 0.9,
        padding: 10,
        position: 'absolute',
        width: '90%',
    },
    touchBox: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    title: {
        color: COLOR_BLACK,
        fontWeight: 'bold',
        fontSize: 13,
    },
    description: {
        color: COLOR_BLACK,
        fontSize: 13,
    },
    text: {
        flex: 1,
    },
    icon: {
        width: 50,
    },
});

type Props = {
    content: TutorialContent,
    boxType: string,
};

type State = {
    position: string,
};

const topOffset = '15%';
const bottomOffset = '80%';

export default class TutorialBox extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            position: topOffset,
        };
    }

    moveBox = () => {
        let { position } = this.state;
        if (position === topOffset) {
            position = bottomOffset;
        } else {
            position = topOffset;
        }
        this.setState({ position });
    };

    renderIcon() {
        const {
            content: { icon },
        } = this.props;
        switch (icon) {
            case 'tap-1':
                return <NumberedTapIconBlack1 />;
            case 'tap-2':
                return <NumberedTapIconBlack2 />;
            case 'tap-3':
                return <NumberedTapIconBlack3 />;
            case 'tap':
                return <TapIconBlack />;
            case 'swipe-left':
                return <SwipeIconBlack />;
            case 'check':
                return <TickGreenOnWhite />;
            default:
                return null;
        }
    }

    render() {
        const {
            boxType,
            content: { title, description },
        } = this.props;
        const { position } = this.state;
        const bgColor =
            boxType === tutorialModes.success
                ? COLOR_SUCCESS_GREEN
                : COLOR_WHITE;
        const textColor =
            boxType === tutorialModes.success ? COLOR_WHITE : COLOR_BLACK;
        const IconComponent = this.renderIcon();
        return (
            <View
                style={[
                    styles.box,
                    { top: position, backgroundColor: bgColor },
                ]}
            >
                <TouchableOpacity onPress={this.moveBox}>
                    <View style={styles.touchBox}>
                        <View style={styles.text}>
                            <Text style={[styles.title, { color: textColor }]}>
                                {title}
                            </Text>
                            <Text
                                style={[
                                    styles.description,
                                    { color: textColor },
                                ]}
                            >
                                {description}
                            </Text>
                        </View>
                        <View style={styles.icon}>{IconComponent}</View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}
