// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import fb from 'react-native-firebase';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { Trans, withTranslation } from 'react-i18next';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    Image,
    TextInput,
} from 'react-native';
import Button from 'apsl-react-native-button';
// $FlowFixMe
import CheckBox from 'react-native-check-box';
import SplashScreen from 'react-native-splash-screen';
import { MessageBarManager } from 'react-native-message-bar';
import convertProfileToV2Format from '../common/ProfileConversion';
import LoadingIcon from './LoadingIcon';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import { COLOR_DEEP_BLUE, COLOR_RED, COLOR_WHITE } from '../constants';

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

const MIN_USERNAME_LENGTH = 4;
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
    screen: number,
    showPasswordError: boolean,
    showUsernameError: boolean,
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
            screen: SCREEN_SIGNUP,
            showPasswordError: false,
            showUsernameError: false,
            signupPPChecked: false,
        };
    }

    componentDidMount() {
        const { auth, navigation } = this.props;
        SplashScreen.hide();
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
        if (username !== null && username.length < MIN_USERNAME_LENGTH) {
            MessageBarManager.showAlert({
                title: t('errorOnSignup'),
                message: t('usernameErrorMessage'),
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }

        if (username !== null && username.indexOf('@') !== -1) {
            MessageBarManager.showAlert({
                title: t('errorOnSignup'),
                message: t('usernameNotEmail'),
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
                    title: t('success'),
                    message: t('welcomeToMapSwipe', { username }),
                    alertType: 'info',
                });
                fb.analytics().logEvent('account_created');
                navigation.navigate('MainNavigator');
            })
            .catch((error) => {
                let errorMsg;
                // error codes from https://rnfirebase.io/docs/v5.x.x/auth/reference/auth#createUserWithEmailAndPassword
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMsg = t('emailAlreadyUsed');
                        break;
                    case 'auth/invalid-email':
                        errorMsg = t('emailInvalid');
                        break;
                    default:
                        errorMsg = t('problemSigningUp');
                }
                MessageBarManager.showAlert({
                    title: t('errorOnSignup'),
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
            .then((userCredentials) => {
                const username = userCredentials.user.user.displayName;
                MessageBarManager.showAlert({
                    title: t('success'),
                    message: t('welcomeToMapSwipe', { username }),
                    alertType: 'info',
                });
                fb.analytics().logEvent('account_login');
                convertProfileToV2Format(firebase);
                parent.props.navigation.navigate('MainNavigator');
            })
            .catch((error) => {
                let errorMessage;
                // error codes from
                // https://rnfirebase.io/docs/v5.x.x/auth/reference/auth#signInWithEmailAndPassword
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = t('noAccountFoundForEmail');
                        break;
                    case 'auth/wrong-password':
                    case 'auth/invalid-email':
                        errorMessage = t('invalidEmailPassword');
                        break;
                    case 'auth/user-disabled':
                        errorMessage = t('accountDisabled');
                        break;
                    default:
                        errorMessage = t('problemLoggingIn');
                }
                MessageBarManager.showAlert({
                    title: t('errorLogIn'),
                    message: errorMessage,
                    alertType: 'error',
                    shouldHideAfterDelay: false,
                });
                parent.setState({
                    loadingNext: false,
                });
            });
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
                    title: t('success'),
                    message: t('checkYourEmail'),
                    alertType: 'info',
                });
                parent.setState({
                    loadingNext: false,
                });
                fb.analytics().logEvent('pass_reset_request');
            })
            .catch((error) => {
                let errorMessage;
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = t('noAccountFoundForEmail');
                        break;
                    case 'auth/invalid-email':
                        errorMessage = t('emailInvalid');
                        break;
                    default:
                        errorMessage = t('problemResettingPassword');
                }
                MessageBarManager.showAlert({
                    title: t('errorResetPass'),
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
                    onChangeText={(text) =>
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
                    autoCompleteType="email"
                    keyboardType="email-address"
                    placeholder={t('enterYourEmail')}
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry={false}
                    style={styles.textInput}
                    onChangeText={(text) =>
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
                    placeholder={t('choosePassword')}
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={(text) =>
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
                    <CheckBox
                        style={{ flex: 1, padding: 5, maxWidth: 30 }}
                        checkedCheckBoxColor={COLOR_WHITE}
                        uncheckedCheckBoxColor={COLOR_WHITE}
                        isChecked={signupPPChecked}
                        onClick={() =>
                            this.setState({ signupPPChecked: !signupPPChecked })
                        }
                    />
                    <Text style={styles.checkboxLabel}>
                        <Trans i18nKey="signup:IagreeToPrivacyNotice">
                            I agree to the bal
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
                    {t('contributionWarningOnSignup')}
                </Text>
                <Button
                    isDisabled={signupButtonDisabled}
                    testID="signup_button"
                    style={styles.otherButton}
                    onPress={this.handleSignUp}
                    textStyle={styles.buttonText}
                >
                    {t('signUp')}
                </Button>
                <Button
                    testID="signup_to_login_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    {t('loginExistingAccount')}
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
                    autoCompleteType="email"
                    keyboardType="email-address"
                    placeholder={t('enterYourEmail')}
                    placeholderTextColor={COLOR_WHITE}
                    style={[styles.textInput, { marginBottom: 28 }]}
                    secureTextEntry={false}
                    onChangeText={(text) =>
                        this.setState({ email: text.replace(' ', '') })
                    }
                    value={email}
                />

                <TextInput
                    testID="login_password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={t('enterYourPassword')}
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry
                    style={[styles.textInput, { marginBottom: 30 }]}
                    onChangeText={(text) => this.setState({ password: text })}
                    value={password}
                />
                <Text style={styles.legalText}>
                    {t('contributionWarningSignup')}
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
                    {t('login')}
                </Button>
                <Button
                    testID="login_to_password_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_FORGOT_PASSWORD)}
                    textStyle={styles.buttonText}
                >
                    {t('forgotPassword')}
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_SIGNUP)}
                    textStyle={styles.buttonText}
                >
                    {t('createNewAccount')}
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
                    placeholder="Enter your email"
                    placeholderTextColor={COLOR_WHITE}
                    style={styles.textInput}
                    onChangeText={(text) =>
                        this.setState({ email: text.replace(' ', '') })
                    }
                    value={email}
                />
                <Text style={styles.legalText}>
                    {t('sendResetEmailWarning')}
                </Text>
                <Button
                    isDisabled={email.length < MIN_EMAIL_LENGTH}
                    style={styles.otherButton}
                    onPress={this.handlePassReset}
                    textStyle={styles.buttonText}
                >
                    {t('sendResetEmail')}
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    {t('backToLogin')}
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
            if (screen === SCREEN_SIGNUP) {
                content = this.renderSignupScreen();
            } else if (screen === SCREEN_LOGIN) {
                content = this.renderLoginScreen();
            } else if (screen === SCREEN_FORGOT_PASSWORD) {
                content = this.renderForgotPasswordScreen();
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
    profile: state.firebase.profile,
});

const enhance = compose(
    withTranslation('login'),
    firebaseConnect(),
    connect(mapStateToProps),
);

export default enhance(_Login);
