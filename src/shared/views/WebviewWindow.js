// @flow
import type { Node } from 'react';
/**
 * The WebviewWindow is the component that opens when you call anything with a webview in it.
 * eg: {this.props.navigation.push('WebViewWindow', { uri: this.state.announcement.url })
 */

/* eslint-disable global-require */

import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import { WebView } from 'react-native-webview';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_WHITE,
    FONT_WEIGHT_BOLD,
    FONT_SIZE_LARGE,
    SPACING_MEDIUM,
} from '../constants';

const GLOBAL = require('../Globals');

const styles = {
    webView: {
        flexGrow: 1,
    },

    backButton: {
        width: 20,
        height: 20,
    },

    backButtonContainer: {
        padding: SPACING_MEDIUM,
    },

    swipeNavTop: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: GLOBAL.SCREEN_WIDTH,
        backgroundColor: COLOR_DEEP_BLUE,
    },

    title: {
        color: COLOR_WHITE,
        fontWeight: FONT_WEIGHT_BOLD,
        fontSize: FONT_SIZE_LARGE,
        padding: SPACING_MEDIUM,
    },
};

type Props = {
    navigation: NavigationProp,
};

// WebviewWindow
export default (props: Props): Node => {
    const { navigation } = props;
    const uri = navigation.getParam('uri', 'https://www.mapswipe.org/');
    const analytics = getAnalytics(getApp());
    logEvent(analytics, 'link_click', { uri });
    return (
        <View style={styles.webView}>
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
                <Text style={styles.title}>{uri}</Text>
            </View>
            <WebView style={{ flex: 1 }} javaScriptEnabled source={{ uri }} />
        </View>
    );
};
