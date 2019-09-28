// @flow
/**
 * The WebviewWindow is the component that opens when you call anything with a webview in it.
 * eg: {this.props.navigation.push('WebViewWindow', { uri: this.state.announcement.url })
 */

/* eslint-disable global-require */

import React from 'react';
import {
    View, Image, WebView, TouchableHighlight,
} from 'react-native';
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
} from '../constants';

const GLOBAL = require('../Globals');

const styles = {
    backButton: {
        width: 20,
        height: 20,
    },
    backButtonContainer: {
        width: 60,
        height: 60,
        top: 0,
        padding: 20,
        left: 0,
        position: 'absolute',
    },
    swipeNavTop: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: 60,
        backgroundColor: COLOR_DEEP_BLUE,

    },
};

type Props = {
    navigation: NavigationProp,
};

// WebviewWindow
export default (props: Props) => {
    const { navigation } = props;
    const uri = navigation.getParam('uri', 'https://www.mapswipe.org/');
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.swipeNavTop}>

                <TouchableHighlight
                    style={styles.backButtonContainer}
                    onPress={() => navigation.pop()}
                >
                    <Image
                        style={styles.backButton}
                        source={require('./assets/backarrow_icon.png')}
                    />
                </TouchableHighlight>

            </View>
            <WebView
                style={{ flex: 1 }}
                javaScriptEnabled
                source={{ uri }}
            />
        </View>
    );
};
