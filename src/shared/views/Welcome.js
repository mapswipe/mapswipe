// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import {
    Text,
    View,
    StyleSheet,
    Image,
} from 'react-native';
import Button from 'apsl-react-native-button';
import SplashScreen from 'react-native-splash-screen';
import Swiper from 'react-native-swiper';
import type { NavigationProp } from '../flow-types';
import { completeWelcome } from '../actions/index';
import {
    COLOR_DEEP_BLUE,
} from '../constants';

const GLOBAL = require('../Globals');

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
        backgroundColor: COLOR_DEEP_BLUE,
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 50,
        left: GLOBAL.SCREEN_WIDTH * 0.05,
    },
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
    welcomeIcon: {
        resizeMode: 'contain',
        width: GLOBAL.SCREEN_WIDTH,
        height: GLOBAL.SCREEN_HEIGHT * 0.5,
    },
});

type Props = {
    navigation: NavigationProp,
    onWelcomeComplete: (any) => any,
    welcomeCompleted: boolean,
};

class _WelcomeScreen extends React.Component<Props> {
    componentDidMount() {
        const { welcomeCompleted } = this.props;
        if (welcomeCompleted) {
            this.finishWelcomeScreens();
        }
    }

    finishWelcomeScreens = () => {
        const { navigation, onWelcomeComplete } = this.props;
        // remember that we saw the welcome screens (in redux state)
        onWelcomeComplete();
        // GLOBAL.ANALYTICS.logEvent('completed_welcome');
        navigation.navigate('Login');
    }

    render() {
        const { welcomeCompleted } = this.props;
        if (welcomeCompleted !== undefined) {
            SplashScreen.hide();
        }
        return (welcomeCompleted
            ? <View style={{ flex: 1 }}><Text /></View>
            : <WelcomeCardView onCompletion={this.finishWelcomeScreens} />
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
        welcomeCompleted: state.ui.user.welcomeCompleted,
    }
);

const mapDispatchToProps = dispatch => (
    {
        onWelcomeComplete: () => {
            dispatch(completeWelcome());
        },
    }
);

// WelcomeScreen
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(_WelcomeScreen);

type WelcomeCardProps = {
    onCompletion: any => any,
};

type WelcomeCardState = {
    newIndex: number,
};

// eslint-disable-next-line react/no-multi-comp
class WelcomeCardView extends React.Component<WelcomeCardProps, WelcomeCardState> {
    swiper: ?Swiper;

    /* eslint-disable global-require */
    render() {
        const { onCompletion } = this.props;
        // GLOBAL.ANALYTICS.logEvent('starting_welcome');
        return (
            <Swiper
                showsButtons={false}
                loop={false}
                ref={(r) => { this.swiper = r; }}
            >
                <View style={styles.slide1}>

                    <Image style={styles.welcomeIcon} source={require('./assets/tut1.png')} />
                    <Text style={styles.text}>
                        You receive groups of satellite images from vulnerable areas.
                    </Text>
                    <Button
                        style={styles.nextButton}
                        onPress={() => this.swiper && this.swiper.scrollBy(1)}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Next
                    </Button>
                </View>
                <View style={styles.slide2}>

                    <Image style={styles.welcomeIcon} source={require('./assets/tut2.png')} />
                    <Text style={styles.text}>
The data helps organisations coordinate humanitarian efforts in the places you
                    map
                    </Text>
                    <Button
                        style={styles.nextButton}
                        onPress={() => this.swiper && this.swiper.scrollBy(1)}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Next
                    </Button>
                </View>
                <View style={styles.slide3}>

                    <Image style={styles.welcomeIcon} source={require('./assets/tut3.png')} />
                    <Text style={styles.text}>
Mapping has already helped save lives. Are you ready to become a mobile
                    volunteer?
                    </Text>
                    <Button
                        style={styles.startButton}
                        onPress={() => onCompletion()}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Sign Up
                    </Button>
                </View>
            </Swiper>
        );
    }
    /* eslint-enable global-require */
}
