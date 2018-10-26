import React from 'react'
import createReactClass from 'create-react-class';
import {Text, View, Platform, StyleSheet, Image, Dimensions, TimerMixin} from "react-native";
//import {DefaultTabBar} from "react-native-scrollable-tab-view";
var GLOBAL = require('../Globals');

var styles = {
    loadingText: {
        color: '#ffffff',
        fontWeight: '300',
        fontSize: 20,
        marginTop: 20,
    },
};

var SetIntervalMixin = {
    componentWillMount: function () {
        this.intervals = [];
    },
    setInterval: function () {
        this.intervals.push(setInterval.apply(null, arguments));
    },
    componentWillUnmount: function () {
        this.intervals.forEach(clearInterval);
    }
};

var LoadingComponent = createReactClass({

    mixins: [SetIntervalMixin], // Use the mixin
    getInitialState: function () {
        return {offset: 0};
    },

    nextOffset: 2,

    loadingImage: function () {
        if (this.state.offset >= 0.8) {
            this.nextOffset = -0.04;
        } else if (this.state.offset <= 0.3) {
            this.nextOffset = 0.02;
        }
        return (
            <View style={{
                opacity: this.state.offset,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: GLOBAL.SCREEN_WIDTH,
                height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT)
            }}>
                <Image style={{width: 100, height: 100}} source={require('./assets/loadinganimation.gif')}/>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    },

    tick: function () {
        this.setState({offset: this.state.offset + this.nextOffset});
    },

    componentDidMount: function () {
        var self = this;
        this.setInterval(self.tick, 1000 / 50); // Call a method on the mixin
    },

    render: function () {
        return (
            this.loadingImage()
        );
    }
});

module.exports = LoadingComponent;
