// @flow
import React from 'react';
import { Image, TouchableHighlight, StyleSheet } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { NavigationContext } from 'react-navigation';
import { FONT_SIZE_LARGE } from '../constants';

import backIcon from '../views/assets/backarrow_icon.png';

const styles = StyleSheet.create({
    backButton: {
        width: FONT_SIZE_LARGE,
        height: FONT_SIZE_LARGE,
    },
});

interface Props {
    style?: ?ViewStyleProp;
    onBackPress?: () => void;
}

function BackButton(props: Props): any {
    const { style, onBackPress } = props;
    const navigation = React.useContext(NavigationContext);

    const handleBackPress = React.useCallback(() => {
        if (onBackPress) {
            onBackPress();
            return;
        }

        navigation.goBack();
    }, [navigation, onBackPress]);

    return (
        <TouchableHighlight style={style} onPress={handleBackPress}>
            <Image style={styles.backButton} source={backIcon} />
        </TouchableHighlight>
    );
}

export default BackButton;
