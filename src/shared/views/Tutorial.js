import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    NetInfo,
} from 'react-native';
import Button from 'apsl-react-native-button';
import SplashScreen from 'react-native-splash-screen';

const Swiper = require('react-native-swiper');
const GLOBAL = require('../Globals');


/**
 * Styling properties for the class
 */


const styles = StyleSheet.create({

    startButton: {
        backgroundColor: '#ee0000',
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 50,
        left: GLOBAL.SCREEN_WIDTH * 0.05,
    },
    nextButton: {
        backgroundColor: '#0d1949',
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 50,
        left: GLOBAL.SCREEN_WIDTH * 0.05,
    },
    otherButton: {
        backgroundColor: '#0d1949',
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        bottom: 50,
    },
    wrapper: {},
    slide1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(230,239,198)',
        flexDirection: 'column',
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: 'rgb(199,231,224)',
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(247,232,172)',
        flexDirection: 'column',
    },

    text: {
        width: GLOBAL.SCREEN_WIDTH * 0.8,
        height: GLOBAL.SCREEN_HEIGHT * 0.5,
        textAlign: 'center',
        fontSize: 20,

    },
    text4: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        marginTop: 10,
        textAlign: 'left',
        fontSize: 13,
        marginBottom: 10,
        color: '#ffffff',
    },
    text5: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        marginTop: 10,
        textAlign: 'left',
        fontSize: 10,
        marginBottom: 10,
        color: '#ffffff',
    },
    tutIcon: {
        resizeMode: 'contain',
        width: GLOBAL.SCREEN_WIDTH,
        height: GLOBAL.SCREEN_HEIGHT * 0.5,
    },
    tutIcon2: {
        resizeMode: 'contain',
        width: 100,
        height: 100,
        marginBottom: 30,
        marginTop: 30,

    },
    textInput: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
        color: '#ffffff',
    },
});

class Tutorial extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'loading',
        };
    }

    componentDidMount() {
        const parent = this;
        NetInfo.getConnectionInfo().then((reach) => {
            GLOBAL.DB.handleSessionStart(reach).then(() => {
                SplashScreen.hide();
                parent.props.navigation.push('ProjectNav');
            }).catch((error) => {
                console.log(error);
                SplashScreen.hide();
                parent.setState({
                    status: 'tutorial',
                });
            });
        });
    }


    render() {
        return this.state.status === 'tutorial' ? <TutCardView navigation={this.props.navigation} />
            : (
                <View style={{ flex: 1 }}>
                    <Text />
                </View>
            );
    }
}

class TutCardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newIndex: 0,
        };
    }

    _handlePress = () => {
        const parent = this;

        GLOBAL.DB.setTutorialComplete().then(() => {
            parent.props.navigation.push('Login');
            // GLOBAL.ANALYTICS.logEvent('completed_tutorial');
        });
    }

    render() {
        // GLOBAL.ANALYTICS.logEvent('starting_tutorial');
        return (
            <Swiper
                style={styles.wrapper}
                showsButtons={false}
                loop={false}
                yourNewPageIndex={this.state.newIndex}
            >
                <View style={styles.slide1}>

                    <Image style={styles.tutIcon} source={require('./assets/tut1.png')} />
                    <Text style={styles.text}>You receive groups of satellite images from vulnerable areas. </Text>
                    <Button
                        style={styles.nextButton}
                        onPress={() => this.setState({ newIndex: 1 })}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Next
                    </Button>
                </View>
                <View style={styles.slide2}>

                    <Image style={styles.tutIcon} source={require('./assets/tut2.png')} />
                    <Text style={styles.text}>
The data helps organisations coordinate humanitarian efforts in the places you
                    map
                    </Text>
                    <Button
                        style={styles.nextButton}
                        onPress={() => this.setState({ newIndex: 1 })}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Next
                    </Button>
                </View>
                <View style={styles.slide3}>

                    <Image style={styles.tutIcon} source={require('./assets/tut3.png')} />
                    <Text style={styles.text}>
Mapping has already helped save lives. Are you ready to become a mobile
                    volunteer?
                    </Text>
                    <Button
                        style={styles.startButton}
                        onPress={this._handlePress}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Sign Up
                    </Button>
                </View>
            </Swiper>
        );
    }
}


module.exports = Tutorial;
