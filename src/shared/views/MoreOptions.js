import React from 'react';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    Image,
} from 'react-native';
import Button from 'apsl-react-native-button';
import * as Progress from 'react-native-progress';

const GLOBAL = require('../Globals');


const styles = StyleSheet.create({
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
        padding: 20,
    },
    text: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
    },
    pic: {
        height: 150,
        width: 150,
        marginTop: -75,
    },
    info: {
        width: GLOBAL.SCREEN_WIDTH > 400 ? 400 : GLOBAL.SCREEN_WIDTH,
        flexDirection: 'row',
        height: 100,
        marginTop: -40,
        marginBottom: -30,
        backgroundColor: 'transparent',
    },
    infoLeft: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 20,
        left: 0,
        fontSize: 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoRight: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 20,
        fontSize: 10,
        right: 20,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoLeftTitle: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    infoRightTitle: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 0,
        right: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
});

class MoreOptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            distance: GLOBAL.DB.getDistance(),
            contributions: GLOBAL.DB.getContributions(),
            progress: GLOBAL.DB.getToNextLevelPercentage(),
            level: GLOBAL.DB.getLevel(),
            levelObject: GLOBAL.DB.getLevelObject(),
        };
    }

    componentDidMount() {
        this.refreshStats();
    }

    refreshStats() {
        const parent = this;
        const { contributions, distance, name } = this.state;
        const user = GLOBAL.DB.getAuth().getUser();
        const username = user ? user.displayName : 'unknown';
        const newContributions = GLOBAL.DB.getContributions();
        const newDistance = GLOBAL.DB.getDistance();
        setInterval(() => {
            if (distance !== newDistance || contributions !== newContributions || name === '') {
                parent.setState({
                    distance: newDistance,
                    contributions: newContributions,
                    levelObject: GLOBAL.DB.getLevelObject(),
                    level: GLOBAL.DB.getLevel(),
                    name: username,
                    progress: GLOBAL.DB.getToNextLevelPercentage(),
                });
            }
        }, 500);
    }

    render() {
        const {
            contributions,
            distance,
            level,
            levelObject,
            name,
            progress,
        } = this.state;
        const { navigation } = this.props;
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <ScrollingBackground />
                <Image style={styles.pic} key={level} source={levelObject.badge} />
                <View style={styles.info}>
                    <Text style={styles.infoLeftTitle}>
                    Level
                        {' '}
                        {level}
                    </Text>
                    <Text style={styles.infoRightTitle}>
                        {name}
                    </Text>
                    <Text style={styles.infoLeft}>
                        {levelObject.title}
                    </Text>
                    <Text style={styles.infoRight}>
                    You&apos;ve mapped
                        {' '}
                        {distance}
                        {' '}
square kilometers and found
                        {' '}
                        {contributions}
                        {' '}
objects
                    </Text>
                </View>
                <LevelProgress progress={progress} />
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'http://mapswipe.org/faq',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={{ fontSize: 13, color: '#0d1949', fontWeight: '700' }}
                    >
Frequently Asked
                    Questions
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: GLOBAL.TUT_LINK,
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={{ fontSize: 13, color: '#0d1949', fontWeight: '700' }}
                    >
Tutorial
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'https://docs.google.com/forms/d/e/1FAIpQLSepCAnr7Jzwc77NsJYjdl4wBOSl8A9J3k-uJUPPuGpHP50LnA/viewform',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={{ fontSize: 13, color: '#0d1949', fontWeight: '700' }}
                    >
Contact Us
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'http://missingmaps.org/events',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={{ fontSize: 13, color: '#0d1949', fontWeight: '700' }}
                    >
Events
                    </Button>
                </View>

                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'http://missingmaps.org/blog',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={{ fontSize: 13, color: '#0d1949', fontWeight: '700' }}
                    >
Blog
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            GLOBAL.DB.getAuth().logOut();
                            navigation.push('WebviewWindow', {
                                uri: 'http://missingmaps.org/events',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={{ fontSize: 13, color: '#0d1949', fontWeight: '700' }}
                    >
Sign Out
                    </Button>
                </View>


            </ScrollView>
        );
    }
}

class ScrollingBackground extends React.Component {
    constructor(props) {
        super(props);
        this.state = { offset: 0 };
        this.bgInterval = 0;
        this.nextOffset = 2;
    }

    componentDidMount() {
        const self = this;
        this.bgInterval = setInterval(self.tick, 1000 / 50);
    }

    componentWillUnmount() {
        clearInterval(this.bgInterval);
    }

    backgroundImage = () => {
        const { offset } = this.state;
        if (offset > 1500) {
            this.nextOffset = -1;
        } else if (offset < -1500) {
            this.nextOffset = 1;
        }
        return (
            <Image
                source={require('./assets/map_new.jpg')}
                style={{
                    resizeMode: 'cover',
                    marginRight: offset,
                    height: 200,
                    backgroundColor: '#e8e8e8',
                }}
            />
        );
    }

    tick = () => {
        let { offset } = this.state;
        offset += this.nextOffset;
        this.setState({ offset });
    }

    render() {
        return (
            this.backgroundImage()
        );
    }
}


class LevelProgress extends React.Component {
    constructor(props) {
        super(props);
        const parent = this;
        this.progressInterval = setInterval(() => {
            const newVal = GLOBAL.DB.getKmTilNextLevel();
            parent.setState({
                text: `${newVal} square km (${Math.ceil((newVal / GLOBAL.DB.getSquareKilometersForZoomLevelPerTile(18)) / 6)} swipes) until the next level`,
            });
        }, 500);
        this.state = {
            textStyle: this.getBarTextStyle(),
            text: `${GLOBAL.DB.getKmTilNextLevel()} square km until the next level`,
        };
    }

    getBarTextStyle() {
        return {
            color: '#ffffff',
            borderColor: '#212121',
            fontWeight: '500',
            position: 'absolute',
            width: GLOBAL.SCREEN_WIDTH,
            left: 0,
            textAlign: 'center',
            paddingTop: 5,
        };
    }

    componentWillUnmount() {
        clearInterval(this.progressInterval);
    }

    render() {
        return (
            <View style={styles.barRow}>
                <Progress.Bar
                    borderRadius={0}
                    borderWidth={0}
                    color="#0d1949"
                    height={30}
                    progress={this.props.progress}
                    unfilledColor="#bbbbbb"
                    width={GLOBAL.SCREEN_WIDTH}
                />
                <Text elevation={5} style={this.state.textStyle}>{this.state.text}</Text>
            </View>
        );
    }
}


module.exports = MoreOptions;
