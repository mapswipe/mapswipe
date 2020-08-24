import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR_BLACK, COLOR_WHITE } from '../../constants';

const styles = StyleSheet.create({
    tutImage: {
        height: 50,
        resizeMode: 'contain',
        width: 50,
    },
});

type IconProps = {
    bgColor: string,
    number: string,
};

type InternalIconProps = {
    ...IconProps,
    image: string,
    textColor: string,
};

/* eslint-disable global-require */
export const NumberedTapIcon = (props: InternalIconProps) => {
    const { bgColor, image, number, textColor } = props;
    return (
        <View>
            <Image source={image} style={styles.tutImage} />
            <Text
                style={{
                    color: textColor,
                    backgroundColor: bgColor,
                    borderRadius: 10,
                    fontWeight: 'bold',
                    left: 30,
                    paddingLeft: 5,
                    position: 'absolute',
                    width: 18,
                }}
            >
                {number}
            </Text>
        </View>
    );
};

export const NumberedTapIconWhite = (props: IconProps) => {
    const { bgColor, number } = props;
    return (
        <NumberedTapIcon
            bgColor={bgColor}
            image={require('../../views/assets/tap_icon_angular_white.png')}
            number={number}
            textColor={COLOR_WHITE}
        />
    );
};

export const NumberedTapIconBlack = (props: IconProps) => {
    const { bgColor, number } = props;
    return (
        <NumberedTapIcon
            bgColor={bgColor}
            image={require('../../views/assets/tap_icon_angular.png')}
            number={number}
            textColor={COLOR_BLACK}
        />
    );
};

export const SwipeIconBlack = () => {
    return (
        <Image
            source={require('../../views/assets/swipeleft_icon_black.png')}
            style={styles.tutImage}
        />
    );
};

export const TapIconBlack = () => {
    return (
        <Image
            source={require('../../views/assets/tap_icon_angular.png')}
            style={styles.tutImage}
        />
    );
};

export const CheckMark = () => {
    return (
        <Image
            source={require('../../views/assets/checkmark_white.png')}
            style={styles.tutImage}
        />
    );
};
