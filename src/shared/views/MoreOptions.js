import React from "react";
import {
    Text,
    View,
    Platform,
    ScrollView,
    ListView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    TimerMixin,
    Linking
} from "react-native";
import {DefaultTabBar} from "react-native-scrollable-tab-view";
import Button from "apsl-react-native-button";
var ProgressBar = require('react-native-progress-bar');
var GLOBAL = require('../Globals');


/**
 * Import the project card component
 * @type {ProjectCard|exports|module.exports}
 */
var ProjectCard = require('./ProjectCard');


var styles = StyleSheet.create({

    container: {
        alignItems: 'center',
        width: GLOBAL.SCREEN_WIDTH,
    },


    otherButton: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 30,
        padding: 12,
        marginTop: 10,
        borderWidth: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 5,
        borderTopWidth: 0.5,
        borderBottomWidth: 0,
        borderColor: '#e8e8e8',
        backgroundColor: '#ffffff',
        width: GLOBAL.SCREEN_WIDTH,
    },
    barRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 0.5,
        borderBottomWidth: 0,
        borderColor: '#e8e8e8',
        width: GLOBAL.SCREEN_WIDTH,
    },
    lastRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 5,
        borderTopWidth: 0,
        borderBottomWidth: 0.5,
        borderColor: '#e8e8e8',
        backgroundColor: '#ffffff',
        width: GLOBAL.SCREEN_WIDTH,
    },
    thumb: {
        width: 40,
        height: 40,
        padding: 20
    },
    text: {
        flex: 1,
        padding: 10,
        marginLeft: 10
    },
    pic: {
        height: 150,
        width: 150,
        marginTop: -75
    },
    info: {
        width: GLOBAL.SCREEN_WIDTH > 400 ? 400 : GLOBAL.SCREEN_WIDTH,
        flexDirection: 'row',
        height: 100,
        marginTop: -40,
        marginBottom: -30,
        backgroundColor: 'transparent'

    },

    infoLeft: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 20,
        left: 0,
        fontSize: 10,
        textAlign: 'center',
        backgroundColor: 'transparent'

    },

    infoRight: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 20,
        fontSize: 10,
        right: 20,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },

    infoLeftTitle: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent'

    },

    infoRightTitle: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 0,
        right: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent'
    }

});

var MoreOptions = React.createClass({

    refreshStats() {
        var parent = this;
        setInterval(function () {
            if (parent.state.distance !== GLOBAL.DB.getDistance() || parent.state.contributions !== GLOBAL.DB.getContributions() || parent.state.name === "") {
                parent.setState({
                    distance: GLOBAL.DB.getDistance(),
                    contributions: GLOBAL.DB.getContributions(),
                    levelObject: GLOBAL.DB.getLevelObject(),
                    level: GLOBAL.DB.getLevel(),
                    name: GLOBAL.DB.getAuth().getUser().displayName,
                    progress: GLOBAL.DB.getToNextLevelPercentage(),
                })

            }
        }, 500);
    },

    componentDidMount() {
        this.refreshStats()
    },

    getInitialState() {
        return {
            name: "",
            distance: GLOBAL.DB.getDistance(),
            contributions: GLOBAL.DB.getContributions(),
            progress: GLOBAL.DB.getToNextLevelPercentage(),
            level: GLOBAL.DB.getLevel(),
            levelObject: GLOBAL.DB.getLevelObject()
        };
    },


    render() {

        console.log()

        return <ScrollView contentContainerStyle={styles.container}>
            <ScrollingBackground/>
            <Image style={styles.pic} key={this.state.level} source={this.state.levelObject.badge}>
            </Image>
            <View style={styles.info}>
                <Text style={styles.infoLeftTitle}>
                    Level {this.state.level}
                </Text>
                <Text style={styles.infoRightTitle}>
                    {this.state.name}
                </Text>
                <Text style={styles.infoLeft}>
                    {this.state.levelObject.title}
                </Text>
                <Text style={styles.infoRight}>
                    You've mapped {this.state.distance} square kilometers and found {this.state.contributions} objects
                </Text>
            </View>
            <LevelProgress progress={this.state.progress}/>
            <View style={styles.row}>
                <Button onPress={() => {
                    this.props.navigator.push({id: 5, data: 'http://mapswipe.org/faq', paging: true})
                }} style={styles.otherButton}
                        textStyle={{fontSize: 13, color: '#0d1949', fontWeight: '700'}}>Frequently Asked
                    Questions</Button>
            </View>
            <View style={styles.row}>
                <Button onPress={() => {
                    this.props.navigator.push({
                        id: 5,
                        data: 'http://www.missingmaps.org/blog/2016/07/18/mapswipetutorial/',
                        paging: true
                    })
                }} style={styles.otherButton}
                        textStyle={{fontSize: 13, color: '#0d1949', fontWeight: '700'}}>Tutorial</Button>
            </View>
            <View style={styles.row}>
                <Button onPress={() => {
                    this.props.navigator.push({
                        id: 5,
                        data: 'https://docs.google.com/forms/d/e/1FAIpQLSepCAnr7Jzwc77NsJYjdl4wBOSl8A9J3k-uJUPPuGpHP50LnA/viewform',
                        paging: true
                    })
                }} style={styles.otherButton}
                        textStyle={{fontSize: 13, color: '#0d1949', fontWeight: '700'}}>Contact Us</Button>
            </View>
            <View style={styles.row}>
                <Button onPress={() => {
                    this.props.navigator.push({id: 5, data: 'http://missingmaps.org/events', paging: true})
                }} style={styles.otherButton}
                        textStyle={{fontSize: 13, color: '#0d1949', fontWeight: '700'}}>Events</Button>
            </View>

            <View style={styles.row}>
                <Button onPress={() => {
                    this.props.navigator.push({id: 5, data: 'http://missingmaps.org/blog', paging: true})
                }} style={styles.otherButton}
                        textStyle={{fontSize: 13, color: '#0d1949', fontWeight: '700'}}>Blog</Button>
            </View>
            <View style={styles.row}>
                <Button onPress={() => {
                    GLOBAL.DB.getAuth().logOut();
                    this.props.navigator.push({id: 4, data: 'http://missingmaps.org/events', paging: true});
                }} style={styles.otherButton}
                        textStyle={{fontSize: 13, color: '#0d1949', fontWeight: '700'}}>Sign Out</Button>
            </View>


        </ScrollView>;
    },
});

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

var ScrollingBackground = React.createClass({


    mixins: [SetIntervalMixin], // Use the mixin
    getInitialState: function () {
        return {offset: 0};
    },

    nextOffset: 2,

    backgroundImage: function () {
        if (this.state.offset > 1500) {
            this.nextOffset = -1;
        } else if (this.state.offset < -1500) {
            this.nextOffset = 1;
        }
        return (
            <Image source={require('./assets/map_new.jpg')} style={{
                resizeMode: 'cover',
                marginRight: this.state.offset,
                height: 200,
                backgroundColor: '#e8e8e8',
            }}/>
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
            this.backgroundImage()
        );
    }
});


var LevelProgress = React.createClass({

    getBarStyle(progress) {
        return {
            height: 30,
            width: GLOBAL.SCREEN_WIDTH,
            borderRadius: 0,

        }
    },

    getBarTextStyle(progress) {
        return {
            color: '#ffffff',
            borderColor: '#212121',
            fontWeight: '500',
            position: 'absolute',
            width: GLOBAL.SCREEN_WIDTH,
            left: 0,
            textAlign: 'center',
            paddingTop: 5,


        }
    },
    getInitialState: function () {
        var parent = this;
        setInterval(function () {
            var newVal = GLOBAL.DB.getKmTilNextLevel();
            parent.setState({
                text: newVal + " square km (" + Math.ceil((newVal / GLOBAL.DB.getSquareKilometersForZoomLevelPerTile(18)) / 6) + " swipes) until the next level"
            })
        }, 500);
        return {
            barStyle: this.getBarStyle(0),
            textStyle: this.getBarTextStyle(0),
            text: GLOBAL.DB.getKmTilNextLevel() + " square km until the next level"

        };
    },

    updateProgress(event, cardsLength) {

    },


    render() {
        return <View style={styles.barRow}>
            <ProgressBar
                fillStyle={{
                    height: 30,
                    borderRadius: 0,
                    backgroundColor: '#0d1949',
                }}
                backgroundStyle={{}}
                style={this.state.barStyle}
                progress={this.props.progress}
            />
            <Text elevation={5} style={this.state.textStyle}>{this.state.text}</Text>
        </View>
    }
});


module.exports = MoreOptions;

