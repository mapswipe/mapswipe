// @flow
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
    COLOR_BLACK,
    COLOR_DARK_GRAY,
    COLOR_SUCCESS_GREEN,
    COLOR_WHITE,
    tutorialModes,
} from '../../constants';
import * as SvgIcons from '../SvgIcons';
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
    svgIcon: {
        borderRadius: 30,
        height: 30,
        padding: 5,
        width: 30,
        backgroundColor: COLOR_DARK_GRAY,
    },
    icon: {
        paddingLeft: 5,
        width: 50,
    },
});

type Props = {
    content: TutorialContent,
    bottomOffset: string,
    boxType: string,
    topOffset: string,
};

type State = {
    position: string,
};
// the icons are in kebab-case we need to camecase them
export const toCamelCase = (s: string): string =>
    s.replace(/-./g, x => x[1].toUpperCase());

export default class TutorialBox extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            position: props.topOffset,
        };
    }

    moveBox: () => void = () => {
        let { position } = this.state;
        const { bottomOffset, topOffset } = this.props;
        if (position === topOffset) {
            position = bottomOffset;
        } else {
            position = topOffset;
        }
        this.setState({ position });
    };

    // eslint-disable-next-line no-undef
    renderIcon(): null | React.Node {
        const {
            content: { icon },
        } = this.props;

        console.warn('icon', icon);

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
                return icon ? (
                    <View style={styles.svgIcon}>
                        <SvgXml
                            xml={SvgIcons[toCamelCase(icon)] ?? null}
                            width="100%"
                            height="100%"
                        />
                    </View>
                ) : null;
        }
    }

    // eslint-disable-next-line no-undef
    render(): React.Node {
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
