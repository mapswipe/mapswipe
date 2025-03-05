// @flow
/* eslint-disable max-classes-per-file */
import React from 'react';
import { connect } from 'react-redux';
import { Text, View, StyleSheet, Image } from 'react-native';
import fb from '@react-native-firebase/app';
import Swiper from 'react-native-swiper';
import { NavigationActions } from 'react-navigation';
import { withTranslation } from 'react-i18next';
import RNBootSplash from 'react-native-bootsplash';
import Button from '../common/Button';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import { completeWelcome } from '../actions/index';
import { COLOR_DEEP_BLUE, COLOR_LIGHT_GRAY, COLOR_RED } from '../constants';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    startButton: {
        alignSelf: 'center',
        backgroundColor: COLOR_RED,
        width: GLOBAL.SCREEN_WIDTH * 0.9,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        marginTop: 50,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR_LIGHT_GRAY,
        flexDirection: 'column',
    },
    heading: {
        color: COLOR_DEEP_BLUE,
        marginBottom: 30,
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        width: GLOBAL.SCREEN_WIDTH * 0.75,
    },
    text: {
        color: COLOR_DEEP_BLUE,
        width: GLOBAL.SCREEN_WIDTH * 0.8,
        textAlign: 'center',
        fontSize: 18,
    },
    welcomeIcon: {
        marginBottom: 30,
        resizeMode: 'contain',
        height: GLOBAL.SCREEN_HEIGHT * 0.3,
        maxWidth: GLOBAL.SCREEN_WIDTH * 0.8,
    },
});

type Props = {
    navigation: NavigationProp,
    onWelcomeComplete: any => any,
    t: TranslationFunction,
    welcomeCompleted: boolean,
};

class _WelcomeScreen extends React.Component<Props> {
    componentDidMount() {
        const { welcomeCompleted } = this.props;
        if (welcomeCompleted) {
            this.finishWelcomeScreens();
        } else {
            RNBootSplash.hide();
        }
    }

    componentDidUpdate() {
        const { welcomeCompleted } = this.props;
        if (welcomeCompleted === undefined) {
            RNBootSplash.hide();
        }
    }

    finishWelcomeScreens = () => {
        const { navigation, onWelcomeComplete } = this.props;
        // remember that we saw the welcome screens (in redux state)
        onWelcomeComplete();
        navigation.reset(
            [NavigationActions.navigate({ routeName: 'Login' })],
            0,
        );
    };

    handleButtonPress = () => {
        fb.analytics().logEvent('complete_onboarding');
        this.finishWelcomeScreens();
    };

    render() {
        const { t, welcomeCompleted } = this.props;
        return welcomeCompleted ? (
            <View style={{ flex: 1 }}>
                <Text />
            </View>
        ) : (
            <WelcomeCardView onCompletion={this.handleButtonPress} t={t} />
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    navigation: ownProps.navigation,
    welcomeCompleted: state.ui.user.welcomeCompleted,
});

const mapDispatchToProps = dispatch => ({
    onWelcomeComplete: () => {
        dispatch(completeWelcome());
    },
});

// WelcomeScreen
export default (withTranslation('welcomeScreen')(
    connect(mapStateToProps, mapDispatchToProps)(_WelcomeScreen),
): any);

type WelcomeCardProps = {
    onCompletion: any => any,
    t: TranslationFunction,
};

type WelcomeCardState = {
    newIndex: number,
};

// eslint-disable-next-line react/no-multi-comp
class WelcomeCardView extends React.Component<
    WelcomeCardProps,
    WelcomeCardState,
> {
    swiper: ?typeof Swiper;

    /* eslint-disable global-require */
    render() {
        const { onCompletion, t } = this.props;
        fb.analytics().logEvent('starting_onboarding');
        return (
            /* $FlowFixMe */
            <Swiper
                activeDotColor={COLOR_DEEP_BLUE}
                showsButtons={false}
                loop={false}
                /* $FlowFixMe */
                ref={r => {
                    this.swiper = r;
                }}
            >
                <View style={styles.slide}>
                    <Image
                        style={styles.welcomeIcon}
                        source={require('./assets/welcome1.png')}
                    />
                    <Text style={styles.heading}>{t('welcomeToMapSwipe')}</Text>
                    <Text style={styles.text}>{t('helpImprove')}</Text>
                </View>

                <View style={styles.slide}>
                    <Image
                        style={styles.welcomeIcon}
                        source={require('./assets/welcome2.png')}
                    />
                    <Text style={styles.heading}>{t('partMissingMaps')}</Text>
                    <Text style={styles.text}>{t('withMissingMaps')}</Text>
                </View>

                <View style={styles.slide}>
                    <Image
                        style={styles.welcomeIcon}
                        source={require('./assets/welcome3.png')}
                    />
                    <Text style={styles.heading}>{t('swipe')}</Text>
                    <Text style={styles.text}>{t('completeTasks')}</Text>
                </View>

                <View style={styles.slide}>
                    <Image
                        style={styles.welcomeIcon}
                        source={require('./assets/welcome4.png')}
                    />
                    <Text style={styles.heading}>{t('createData')}</Text>
                    <Text style={styles.text}>{t('dataUse')}</Text>
                </View>

                <View style={styles.slide}>
                    <Image
                        style={styles.welcomeIcon}
                        source={require('./assets/welcome5.png')}
                    />
                    <Text style={styles.heading}>{t('saveLives')}</Text>
                    <Text style={styles.text}>{t('mapHelps')}</Text>
                    <Button
                        style={styles.startButton}
                        onPress={() => onCompletion()}
                        textStyle={{
                            fontSize: 18,
                            color: COLOR_LIGHT_GRAY,
                            fontWeight: '700',
                        }}
                    >
                        {t('signup:signUp')}
                    </Button>
                </View>
            </Swiper>
        );
    }
    /* eslint-enable global-require */
}
