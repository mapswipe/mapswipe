import React from 'react'
import {Text, View, Platform, StyleSheet, Image, Dimensions, TimerMixin} from "react-native";
var GLOBAL = require('../Globals');

var styles = {
    loadingText: {
        color: '#ffffff',
        fontWeight: '300',
        fontSize: 20,
        marginTop: 20,
    },
};

class LoadingComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            offset: 0,
        };
    }

    componentWillMount() {
        this.intervals = [];
    }

    setInterval() {
        this.intervals.push(setInterval.apply(null, arguments));
    }

    componentWillUnmount() {
        this.intervals.forEach(clearInterval);
    }

    nextOffset: 2;

    loadingImage = () => {
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
    }

    tick = () => {
        this.setState({offset: this.state.offset + this.nextOffset});
    }

    componentDidMount() {
        var self = this;
        this.setInterval(self.tick, 1000 / 50);
    }

    render() {
        return (
            this.loadingImage()
        );
    }
}

module.exports = LoadingComponent;
