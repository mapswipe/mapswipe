// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import fb from '@react-native-firebase/app';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { Trans, withTranslation } from 'react-i18next';
import {
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { MessageBarManager } from 'react-native-message-bar';
import RNBootSplash from 'react-native-bootsplash';
import debugInfo from '../../../debugInfo';
import Button from '../common/Button';
import convertProfileToV2Format from '../common/ProfileConversion';
import LoadingIcon from './LoadingIcon';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_RED,
    COLOR_WHITE,
    devOsmUrl,
    MIN_USERNAME_LENGTH,
} from '../constants';
import { isValidUsername } from '../utils';

/* eslint-disable global-require */

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    buttonText: {
        color: COLOR_WHITE,
        fontSize: 13,
        fontWeight: '700',
    },
    switchToLogin: {
        width: GLOBAL.SCREEN_WIDTH * 0.9,
        height: 50,
        padding: 12,
        borderRadius: 0,
        borderWidth: 0,
    },
    otherButton: {
        backgroundColor: 'rgb(255,25,25)',
        width: GLOBAL.SCREEN_WIDTH * 0.9,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    container: {
        width: GLOBAL.SCREEN_WIDTH,
        height: GLOBAL.SCREEN_HEIGHT,
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
    },
    checkboxLabel: {
        flex: 1,
        textAlign: 'left',
        fontSize: 13,
        marginBottom: 5,
        marginLeft: 10,
        marginTop: 8,
        color: COLOR_WHITE,
        width: 250,
    },
    inputLabel: {
        width: GLOBAL.SCREEN_WIDTH * 0.9,
        marginTop: 5,
        textAlign: 'left',
        fontSize: 13,
        marginBottom: 5,
        color: COLOR_WHITE,
    },
    legalText: {
        width: GLOBAL.SCREEN_WIDTH * 0.9,
        marginTop: 10,
        textAlign: 'left',
        fontSize: 10,
        marginBottom: 10,
        color: COLOR_WHITE,
    },
    policyLink: {
        color: COLOR_WHITE,
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    tutIcon2: {
        resizeMode: 'contain',
        width: 100,
        height: 100,
        marginBottom: 30,
        marginTop: 30,
    },
    textInput: {
        width: GLOBAL.SCREEN_WIDTH * 0.9,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 5,
        color: COLOR_WHITE,
        paddingLeft: 10,
    },
});

// Screen constants
const SCREEN_SIGNUP = 0;
const SCREEN_LOGIN = 1;
const SCREEN_FORGOT_PASSWORD = 2;
const SCREEN_OSM_LOGIN = 3;

const MIN_PASSWORD_LENGTH = 6;
const MIN_EMAIL_LENGTH = 6;

type Props = {
    auth: {},
    firebase: Object,
    navigation: NavigationProp,
    t: TranslationFunction,
};

type State = {
    username: string,
    password: string,
    email: string,
    loadingAuth: boolean,
    loadingNext: boolean,
    osmAuthError: ?string,
    screen: number,
    showPasswordError: boolean,
    showUsernameError: boolean,
    signupOSMPPChecked: boolean,
    signupPPChecked: boolean,
};

class _Login extends React.Component<Props, State> {
    didBlurSubscription: () => void;

    constructor(props: Props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
            loadingAuth: true, // whether the authentication info is loaded from firebase yet
            loadingNext: false, // whether we're waiting for the next screen to load
            // loadingNext prevents showing the login screen when already authenticated
            osmAuthError: undefined,
            screen: SCREEN_SIGNUP,
            showPasswordError: false,
            showUsernameError: false,
            // is the privay policy checkbox checked on the OSM screen
            signupOSMPPChecked: false,
            // is the privay policy checkbox checked on the (email+pass) signup screen
            signupPPChecked: false,
        };
    }

    componentDidMount() {
        const { auth, navigation } = this.props;
        RNBootSplash.hide();
        if (isLoaded(auth)) {
            if (!isEmpty(auth)) {
                this.setState({ loadingNext: true });
                navigation.navigate('MainNavigator');
            } else {
                // auth is loaded, but we're not logged in
                this.setState({ loadingAuth: false });
            }
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { auth, navigation } = this.props;
        console.log('ROUTE', Date(), navigation.state.params, navigation);
        // if arrived here with a deeplink (from the OSM auth page)
        // handle this before anything else
        if (navigation.state.params !== undefined) {
            const { code, error, state, token } = navigation.state.params;
            if (navigation.state.params !== prevProps.navigation.state.params) {
                this.OSMOauthCallback(code, state, token, error);
            }
        }
        if (auth !== prevProps.auth) {
            if (isLoaded(auth) && !isEmpty(auth)) {
                navigation.navigate('MainNavigator');
            }
        }
    }

    handleSignUp = () => {
        const { firebase, navigation, t } = this.props;
        const { email, password, username } = this.state;
        const parent = this;

        if (username !== null && username.indexOf('@') !== -1) {
            MessageBarManager.showAlert({
                title: t('signup:errorOnSignup'),
                message: t('signup:usernameNotEmail'),
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }

        if (!isValidUsername(username)) {
            MessageBarManager.showAlert({
                title: t('signup:errorOnSignup'),
                message: t('signup:usernameErrorMessage'),
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }

        this.setState({
            loadingNext: true,
        });

        firebase
            .createUser({ email, password }, { username })
            .then(() => {
                // firebase doesn't record the username by default
                firebase.updateAuth({
                    displayName: username,
                });
            })
            .then(() => {
                firebase.reloadAuth();
            })
            .then(() => {
                firebase.updateProfile({
                    created: GLOBAL.DB.getTimestamp(),
                    groupContributionCount: 0,
                    projectContributionCount: 0,
                    taskContributionCount: 0,
                    username,
                });
            })
            .then(() => {
                MessageBarManager.showAlert({
                    title: t('signup:success'),
                    message: t('signup:welcomeToMapSwipe', { username }),
                    alertType: 'info',
                });
                fb.analytics().logEvent('account_created');
                navigation.navigate('MainNavigator');
            })
            .catch(error => {
                let errorMsg;
                // error codes from https://rnfirebase.io/docs/v5.x.x/auth/reference/auth#createUserWithEmailAndPassword
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMsg = t('signup:emailAlreadyUsed');
                        break;
                    case 'auth/invalid-email':
                        errorMsg = t('signup:emailInvalid');
                        break;
                    default:
                        errorMsg = t('signup:problemSigningUp');
                }
                MessageBarManager.showAlert({
                    title: t('signup:errorOnSignup'),
                    message: errorMsg,
                    alertType: 'error',
                    shouldHideAfterDelay: false,
                });
                parent.setState({
                    loadingNext: false,
                });
            });
    };

    switchScreens = (screen: number) => {
        this.setState({
            screen,
        });
    };

    handleLogin = () => {
        const { email, password } = this.state;
        const { firebase, t } = this.props;
        this.setState({
            loadingNext: true,
        });
        const parent = this;
        firebase
            .login({ email, password })
            .then(userCredentials => {
                const username = userCredentials.user.user.displayName;
                MessageBarManager.showAlert({
                    title: t('signup:success'),
                    message: t('signup:welcomeToMapSwipe', { username }),
                    alertType: 'info',
                });
                fb.analytics().logEvent('account_login');
                convertProfileToV2Format(firebase);
                parent.props.navigation.navigate('MainNavigator');
            })
            .catch(error => {
                let errorMessage;
                // error codes from
                // https://rnfirebase.io/docs/v5.x.x/auth/reference/auth#signInWithEmailAndPassword
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = t('signup:noAccountFoundForEmail');
                        break;
                    case 'auth/wrong-password':
                    case 'auth/invalid-email':
                        errorMessage = t('signup:invalidEmailPassword');
                        break;
                    case 'auth/user-disabled':
                        errorMessage = t('signup:accountDisabled');
                        break;
                    default:
                        errorMessage = t('signup:problemLoggingIn');
                }
                MessageBarManager.showAlert({
                    title: t('signup:errorLogIn'),
                    message: errorMessage,
                    alertType: 'error',
                    shouldHideAfterDelay: false,
                });
                parent.setState({
                    loadingNext: false,
                });
            });
    };

    OSMOauthCallback = (
        osmCode: string,
        osmState: string,
        fbToken: string,
        osmError: string,
    ) => {
        const { firebase, t } = this.props;
        console.log('OSM callback', osmCode, osmState, fbToken, osmError);
        // call /token now, which will get a token from firebase
        // and redirect here via deeplink
        if (osmError !== undefined && fbToken === undefined) {
            console.log(
                'Error while authenticating with OSM',
                osmError,
                fbToken,
            );
            // FIXME: show the error properly here
            // the server sends error_description along with error
            if (osmError === 'access_denied') {
                // forcefully erase the error state which react-navigation
                // otherwise keeps across screen reloads
                // This is expected behaviour in react-navigation v4, but was changed
                // in v6, see: https://reactnavigation.org/docs/upgrading-from-5.x#params-are-now-overwritten-on-navigation-instead-of-merging
                // navigation.setParams({ previousError: osmError });
                // navigation.getParam('previousError', false)
                this.setState({ loadingNext: false, osmAuthError: osmError });
            }
        } else if (fbToken !== undefined) {
            // we got a token from firebase, use it to sign in with firebase
            firebase
                .auth()
                .signInWithCustomToken(fbToken)
                .then(userCredentials => {
                    // Signed in
                    const username = userCredentials.user.displayName;
                    // it is difficult to find out if this is a signup or a login
                    // here. firebase provides a isNewUser boolean, but it seems
                    // to always be false :( so instead we set the initial user
                    // profile in the backend function
                    MessageBarManager.showAlert({
                        title: t('signup:success'),
                        message: t('signup:welcomeToMapSwipe', { username }),
                        alertType: 'info',
                    });
                    fb.analytics().logEvent('account_login');
                })
                .catch(error => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log('osm auth failed', errorCode, errorMessage);
                });
        }
    };

    handleOSMLogin = () => {
        this.setState({
            loadingNext: true,
        });
        // This is the start of the OSM login flow.
        // Call redirect which will send the user to the OSM login page
        // which in turn will send them back to the app's deeplink
        // which will take them to OSMOauthCallback
        Linking.openURL(`${debugInfo.oauthHost}/redirect`);
    };

    handlePassReset = () => {
        const { email } = this.state;
        const { firebase, t } = this.props;
        this.setState({
            loadingNext: true,
        });
        const parent = this;
        firebase
            .auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                MessageBarManager.showAlert({
                    title: t('signup:success'),
                    message: t('signup:checkYourEmail'),
                    alertType: 'info',
                });
                parent.setState({
                    loadingNext: false,
                });
                fb.analytics().logEvent('pass_reset_request');
            })
            .catch(error => {
                let errorMessage;
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = t('signup:noAccountFoundForEmail');
                        break;
                    case 'auth/invalid-email':
                        errorMessage = t('signup:emailInvalid');
                        break;
                    default:
                        errorMessage = t('signup:problemResettingPassword');
                }
                MessageBarManager.showAlert({
                    title: t('signup:errorResetPass'),
                    message: errorMessage,
                    alertType: 'error',
                    shouldHideAfterDelay: false,
                });
                parent.setState({
                    loadingNext: false,
                });
            });
    };

    renderSignupScreen = () => {
        const { navigation, t } = this.props;
        const {
            email,
            password,
            showPasswordError,
            showUsernameError,
            signupPPChecked,
            username,
        } = this.state;
        const signupButtonDisabled =
            email.length < MIN_EMAIL_LENGTH ||
            username.length < MIN_USERNAME_LENGTH ||
            password.length < MIN_PASSWORD_LENGTH ||
            !signupPPChecked;

        return (
            <ScrollView
                style={styles.container}
                testID="signup_screen"
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: COLOR_DEEP_BLUE,
                    padding: 20,
                }}
            >
                <Image
                    style={styles.tutIcon2}
                    source={require('./assets/loadinganimation.gif')}
                />

                <TextInput
                    testID="signup_username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={t('signup:chooseUsername')}
                    placeholderTextColor={COLOR_WHITE}
                    style={styles.textInput}
                    onChangeText={text =>
                        this.setState({
                            showUsernameError:
                                text.length < MIN_USERNAME_LENGTH,
                            username: text,
                        })
                    }
                    value={username}
                />
                {showUsernameError ? (
                    <Text
                        style={[
                            styles.inputLabel,
                            {
                                color: showUsernameError
                                    ? COLOR_RED
                                    : COLOR_DEEP_BLUE,
                            },
                        ]}
                    >
                        {t('signup:usernameError')}
                    </Text>
                ) : (
                    <Text style={styles.inputLabel}>
                        {t('signup:usernamePublic')}
                    </Text>
                )}

                <TextInput
                    testID="signup_email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder={t('signup:enterYourEmail')}
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry={false}
                    style={styles.textInput}
                    onChangeText={text =>
                        this.setState({ email: text.replace(' ', '') })
                    }
                    value={email}
                />
                <Text style={[styles.inputLabel, { color: COLOR_DEEP_BLUE }]}>
                    &nbsp;
                </Text>

                <TextInput
                    testID="signup_password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={t('signup:choosePassword')}
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={text =>
                        this.setState({
                            password: text,
                            showPasswordError:
                                text.length < MIN_PASSWORD_LENGTH,
                        })
                    }
                />
                <Text
                    style={[
                        styles.inputLabel,
                        {
                            color: showPasswordError
                                ? COLOR_RED
                                : COLOR_DEEP_BLUE,
                        },
                    ]}
                >
                    {t('signup:passwordError')}
                </Text>

                <View style={{ flex: 1, flexDirection: 'row', height: 35 }}>
                    <BouncyCheckbox
                        iconStyle={{ borderColor: 'gray', borderWidth: 2 }}
                        unfillColor={COLOR_WHITE}
                        fillColor={COLOR_DEEP_BLUE}
                        isChecked={signupPPChecked}
                        onPress={() =>
                            this.setState({ signupPPChecked: !signupPPChecked })
                        }
                    />
                    <Text style={styles.checkboxLabel}>
                        <Trans i18nKey="signup:IagreeToPrivacyNotice">
                            I agree to the
                            <Text
                                style={styles.policyLink}
                                onPress={() => {
                                    navigation.push('WebviewWindow', {
                                        uri: 'https://mapswipe.org/privacy',
                                    });
                                }}
                            >
                                Privacy Notice
                            </Text>
                        </Trans>
                    </Text>
                </View>

                <Text style={styles.legalText}>
                    {t('signup:contributionWarningOnSignup')}
                </Text>
                <Button
                    isDisabled={signupButtonDisabled}
                    testID="signup_button"
                    style={styles.otherButton}
                    onPress={this.handleSignUp}
                    textStyle={styles.buttonText}
                >
                    {t('signup:signUp')}
                </Button>
                <Button
                    testID="signup_to_login_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    {t('signup:loginExistingAccount')}
                </Button>

                <Button
                    testID="signup_to_osm_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_OSM_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    {t('signup:loginSignupWithOSM')}
                </Button>
            </ScrollView>
        );
    };

    renderLoginScreen = () => {
        const { t } = this.props;
        const { email, password } = this.state;
        return (
            <ScrollView
                testID="login_screen"
                style={styles.container}
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: COLOR_DEEP_BLUE,
                    padding: 20,
                }}
            >
                <Image
                    style={styles.tutIcon2}
                    source={require('./assets/loadinganimation.gif')}
                />

                <TextInput
                    testID="login_email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder={t('signup:enterYourEmail')}
                    placeholderTextColor={COLOR_WHITE}
                    style={[styles.textInput, { marginBottom: 28 }]}
                    secureTextEntry={false}
                    onChangeText={text =>
                        this.setState({ email: text.replace(' ', '') })
                    }
                    value={email}
                />

                <TextInput
                    testID="login_password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={t('signup:enterYourPassword')}
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry
                    style={[styles.textInput, { marginBottom: 30 }]}
                    onChangeText={text => this.setState({ password: text })}
                    value={password}
                />
                <Text style={styles.legalText}>
                    {t('signup:contributionWarningOnSignup')}
                </Text>
                <Button
                    isDisabled={
                        email.length < MIN_EMAIL_LENGTH ||
                        password.length < MIN_PASSWORD_LENGTH
                    }
                    testID="login_button"
                    style={styles.otherButton}
                    onPress={this.handleLogin}
                    textStyle={styles.buttonText}
                >
                    {t('signup:login')}
                </Button>
                <Button
                    testID="login_to_password_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_FORGOT_PASSWORD)}
                    textStyle={styles.buttonText}
                >
                    {t('signup:forgotPassword')}
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_SIGNUP)}
                    textStyle={styles.buttonText}
                >
                    {t('signup:createNewAccount')}
                </Button>
            </ScrollView>
        );
    };

    renderForgotPasswordScreen = () => {
        const { email } = this.state;
        const { t } = this.props;
        return (
            <ScrollView
                testID="forgot_password_screen"
                style={styles.container}
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: COLOR_DEEP_BLUE,
                    padding: 20,
                }}
            >
                <Image
                    style={styles.tutIcon2}
                    source={require('./assets/loadinganimation.gif')}
                />

                <TextInput
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder={t('signup:enterYourEmail')}
                    placeholderTextColor={COLOR_WHITE}
                    style={styles.textInput}
                    onChangeText={text =>
                        this.setState({ email: text.replace(' ', '') })
                    }
                    secureTextEntry={false}
                    value={email}
                />
                <Text style={styles.legalText}>
                    {t('signup:sendResetEmailWarning')}
                </Text>
                <Button
                    isDisabled={email.length < MIN_EMAIL_LENGTH}
                    style={styles.otherButton}
                    onPress={this.handlePassReset}
                    textStyle={styles.buttonText}
                >
                    {t('signup:sendResetEmail')}
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    {t('signup:backToLogin')}
                </Button>
            </ScrollView>
        );
    };

    renderOSMLoginScreen = () => {
        const { osmAuthError, signupOSMPPChecked } = this.state;
        const { navigation, t } = this.props;
        return (
            <ScrollView
                testID="forgot_password_screen"
                style={styles.container}
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: COLOR_DEEP_BLUE,
                    padding: 20,
                }}
            >
                <Image
                    style={styles.tutIcon2}
                    source={require('./assets/loadinganimation.gif')}
                />

                <Text style={styles.inputLabel}>
                    {t('signup:OSMsignupExplanation')}
                </Text>

                {debugInfo.oauthHost.includes('dev') && (
                    <Text
                        style={[styles.policyLink, { padding: 10 }]}
                        onPress={() => {
                            Linking.openURL(devOsmUrl);
                        }}
                    >
                        You are using the DEV app. This will log you in to the
                        DEVELOPMENT version of OSM, not the main site. (tap here
                        to create a test OSM account)
                    </Text>
                )}
                <Button
                    isDisabled={!signupOSMPPChecked}
                    style={styles.otherButton}
                    onPress={this.handleOSMLogin}
                    textStyle={styles.buttonText}
                >
                    {t('signup:loginSignupWithOSM')}
                </Button>

                <View style={{ flex: 1, flexDirection: 'row', height: 35 }}>
                    <BouncyCheckbox
                        iconStyle={{ borderColor: 'gray', borderWidth: 2 }}
                        unfillColor={COLOR_WHITE}
                        fillColor={COLOR_DEEP_BLUE}
                        isChecked={signupOSMPPChecked}
                        onPress={() =>
                            this.setState({
                                signupOSMPPChecked: !signupOSMPPChecked,
                            })
                        }
                    />
                    <Text style={styles.checkboxLabel}>
                        <Trans i18nKey="signup:IagreeToPrivacyNotice">
                            I agree to the
                            <Text
                                style={styles.policyLink}
                                onPress={() => {
                                    navigation.push('WebviewWindow', {
                                        uri: 'https://mapswipe.org/privacy',
                                    });
                                }}
                            >
                                Privacy Notice
                            </Text>
                        </Trans>
                    </Text>
                </View>

                {osmAuthError !== undefined ? (
                    <Text
                        style={[
                            styles.inputLabel,
                            {
                                color:
                                    osmAuthError !== undefined
                                        ? COLOR_RED
                                        : COLOR_WHITE,
                            },
                        ]}
                    >
                        {t('signup:osmAuthError')}
                        osmAuthError
                    </Text>
                ) : (
                    <Text style={styles.inputLabel}>
                        {t('signup:usernamePublic')}
                    </Text>
                )}

                <Button
                    testID="osm_to_login_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    {t('signup:loginExistingAccount')}
                </Button>
            </ScrollView>
        );
    };

    render() {
        const { auth } = this.props;
        const { loadingAuth, loadingNext, screen } = this.state;
        let content = null;

        const showLoader = !isLoaded(auth) || loadingAuth || loadingNext;

        if (!showLoader) {
            switch (screen) {
                case SCREEN_LOGIN:
                    content = this.renderLoginScreen();
                    break;
                case SCREEN_FORGOT_PASSWORD:
                    content = this.renderForgotPasswordScreen();
                    break;
                case SCREEN_OSM_LOGIN:
                    content = this.renderOSMLoginScreen();
                    break;
                case SCREEN_SIGNUP:
                    content = this.renderSignupScreen();
                    break;
                default:
                    content = this.renderSignupScreen();
            }
        }

        return (
            <View style={styles.container}>
                {!isLoaded(auth) || loadingAuth || loadingNext ? (
                    <LoadingIcon />
                ) : (
                    content
                )}
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    auth: state.firebase.auth,
    navigation: ownProps.navigation,
});

const enhance = compose(
    withTranslation('login'),
    firebaseConnect(),
    connect(mapStateToProps),
);

export default (enhance(_Login): any);
