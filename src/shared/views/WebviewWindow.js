/**
 * The WebviewWindow is the component that opens when you call anything with a webview in it.
 * You do it like this: {this.props.navigation.push('WebViewWindow', { uri: this.state.announcement.url })
 */

import React from "react";
import {Text, View, Platform, StyleSheet, Image, Dimensions, WebView, TouchableHighlight} from "react-native";
import {DefaultTabBar} from "react-native-scrollable-tab-view";
var GLOBAL = require('../Globals');

var styles = {
    loadingText: {
        color: '#ffffff',
        fontWeight: '300',
        fontSize: 20,
        marginTop: 20,
    },
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
        position: 'absolute'
    },
    infoButton: {
        width: 20,
        height: 20,

    },

    infoButtonContainer: {
        width: 20,
        height: 20,
        top: 20,
        right: 20,
        position: 'absolute'
    },
    swipeNavTop: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: 60,
        backgroundColor: '#0d1949'

    },
};

class WebviewWindow extends React.Component {

    returnToView = () => {
        this.props.navigation.pop();
    }

    render() {
        const uri = this.props.navigation.getParam('uri', 'https://www.mapswipe.org/');
        return (
            <View style={{flex: 1}}>
                <View style={styles.swipeNavTop}>

                    <TouchableHighlight style={styles.backButtonContainer} onPress={this.returnToView}><Image
                        style={styles.backButton} source={require('./assets/backarrow_icon.png')}/></TouchableHighlight>

                </View>
                <WebView
                    style={{flex: 1}}
                    javaScriptEnabled={true}
                    source={{uri: uri}}
                />
            </View>
        );
    }
}

module.exports = WebviewWindow;
