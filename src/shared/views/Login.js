// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import fb from 'react-native-firebase';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { withNamespaces } from 'react-i18next';
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
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_RED,
    COLOR_WHITE,
} from '../constants';

/* eslint-disable global-require */

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    buttonText: {
        color: COLOR_WHITE,
        fontSize: 13,
        fontWeight: '700',
    },
    switchToLogin: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        height: 50,
        padding: 12,
        borderRadius: 0,
        borderWidth: 0,
    },
    otherButton: {
        backgroundColor: 'rgb(255,25,25)',
        width: GLOBAL.SCREEN_WIDTH * 0.90,
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
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        marginTop: 5,
        textAlign: 'left',
        fontSize: 13,
        marginBottom: 5,
        color: COLOR_WHITE,
    },
    legalText: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
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
        width: GLOBAL.SCREEN_WIDTH * 0.90,
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

type Props = {
    auth: {},
    firebase: Object,
    navigation: NavigationProp,
    t: (string) => string,
}

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
}

class _Login extends React.Component<Props, State> {
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
        const {
            firebase,
            navigation,
        } = this.props;
        const {
            email,
            password,
            username,
        } = this.state;
        const parent = this;
        if (username !== null && username.length < 3) {
            MessageBarManager.showAlert({
                title: 'Error on sign up',
                message: 'Your username must be 4 characters or more',
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }

        if (username !== null && username.indexOf('@') !== -1) {
            MessageBarManager.showAlert({
                title: 'Error on sign up',
                message: 'Your username can not be an email',
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }
        this.setState({
            loadingNext: true,
        });

        firebase.createUser({ email, password }, { username })
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
                });
            })
            .then(() => {
                MessageBarManager.showAlert({
                    title: 'Success',
                    message: `Welcome to Mapswipe, ${username}`,
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
                    errorMsg = 'Email already used by another account';
                    break;
                case 'auth/invalid-email':
                    errorMsg = 'Email address is invalid';
                    break;
                default:
                    errorMsg = 'Problem signing up';
                }
                MessageBarManager.showAlert({
                    title: 'Error on sign up',
                    message: errorMsg,
                    alertType: 'error',
                    shouldHideAfterDelay: false,
                });
                parent.setState({
                    loadingNext: false,
                });
            });
    }

    switchScreens = (screen: number) => {
        this.setState({
            screen,
        });
    }

    handleLogin = () => {
        const {
            email,
            password,
        } = this.state;
        const { firebase } = this.props;
        this.setState({
            loadingNext: true,
        });
        const parent = this;
        firebase.login({ email, password }).then((userCredentials) => {
            MessageBarManager.showAlert({
                title: 'Success',
                message: `Welcome to Mapswipe, ${userCredentials.user.user.displayName}`,
                alertType: 'info',
            });
            fb.analytics().logEvent('account_login');
            convertProfileToV2Format(firebase);
            parent.props.navigation.navigate('MainNavigator');
        }).catch((error) => {
            let errorMessage;
            // error codes from
            // https://rnfirebase.io/docs/v5.x.x/auth/reference/auth#signInWithEmailAndPassword
            switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account with this email address';
                break;
            case 'auth/wrong-password':
            case 'auth/invalid-email':
                errorMessage = 'Invalid email or password';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Account disabled';
                break;
            default:
                errorMessage = 'Problem logging in';
            }
            MessageBarManager.showAlert({
                title: 'Error on log in',
                message: errorMessage,
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            parent.setState({
                loadingNext: false,
            });
        });
    }

    handlePassReset = () => {
        const {
            email,
        } = this.state;
        const { firebase } = this.props;
        this.setState({
            loadingNext: true,
        });
        const parent = this;
        firebase.auth().sendPasswordResetEmail(email).then(() => {
            MessageBarManager.showAlert({
                title: 'Success',
                message: 'Check your email',
                alertType: 'info',
            });
            parent.setState({
                loadingNext: false,
            });
            fb.analytics().logEvent('pass_reset_request');
        }).catch((error) => {
            let errorMessage;
            switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found for this email';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            default:
                errorMessage = 'Problem resetting your password';
            }
            MessageBarManager.showAlert({
                title: 'Error on reset pass',
                message: errorMessage,
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            parent.setState({
                loadingNext: false,
            });
        });
    }

    didBlurSubscription: () => void;

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
        const signupButtonDisabled = email.length < 6
            || username.length < 4
            || password.length < 6
            || !signupPPChecked;

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
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                <TextInput
                    testID="signup_username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={t('signup:chooseUsername')}
                    placeholderTextColor={COLOR_WHITE}
                    style={styles.textInput}
                    onChangeText={text => this.setState({
                        showUsernameError: text.length < 4,
                        username: text,
                    })}
                    value={username}
                />
                {showUsernameError
                    ? (
                        <Text
                            style={[styles.inputLabel,
                                { color: (showUsernameError ? COLOR_RED : COLOR_DEEP_BLUE) }]}
                        >
                            {t('signup:usernameError')}
                        </Text>
                    ) : (
                        <Text style={styles.inputLabel}>
                            {t('signup:usernamePublic')}
                        </Text>
                    )
                }

                <TextInput
                    testID="signup_email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoCompleteType="email"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry={false}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text
                    style={[styles.inputLabel, { color: COLOR_DEEP_BLUE }]}
                >
                    &nbsp;
                </Text>

                <TextInput
                    testID="signup_password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Choose your password"
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={text => this.setState({
                        password: text,
                        showPasswordError: text.length < 6,
                    })}
                />
                <Text style={[styles.inputLabel,
                    { color: (showPasswordError ? COLOR_RED : COLOR_DEEP_BLUE) }]}
                >
                    {t('signup:passwordError')}
                </Text>

                <View style={{ flex: 1, flexDirection: 'row', height: 35 }}>
                    <CheckBox
                        style={{ flex: 1, padding: 5, maxWidth: 30 }}
                        checkedCheckBoxColor={COLOR_WHITE}
                        uncheckedCheckBoxColor={COLOR_WHITE}
                        isChecked={signupPPChecked}
                        onClick={() => this.setState({ signupPPChecked: !signupPPChecked })}
                    />
                    <Text style={styles.checkboxLabel}>
                        I agree to the&nbsp;
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
                    </Text>
                </View>

                <Text style={styles.legalText}>
                    * All the mapping you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be
                    shared with anyone.
                </Text>
                <Button
                    isDisabled={signupButtonDisabled}
                    testID="signup_button"
                    style={styles.otherButton}
                    onPress={this.handleSignUp}
                    textStyle={styles.buttonText}
                >
                    Sign Up
                </Button>
                <Button
                    testID="signup_to_login_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    Log in to an existing account
                </Button>
            </ScrollView>
        );
    }

    renderLoginScreen = () => {
        const {
            email,
            password,
        } = this.state;
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
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                <TextInput
                    testID="login_email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoCompleteType="email"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor={COLOR_WHITE}
                    style={[styles.textInput, { marginBottom: 28 }]}
                    secureTextEntry={false}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />

                <TextInput
                    testID="login_password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Enter your password"
                    placeholderTextColor={COLOR_WHITE}
                    secureTextEntry
                    style={[styles.textInput, { marginBottom: 30 }]}
                    onChangeText={text => this.setState({ password: text })}
                    value={password}
                />
                <Text style={styles.legalText}>
                    * All the data you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be
                    shared with anyone.
                    {' '}
                </Text>
                <Button
                    isDisabled={email.length < 6 || password.length < 6}
                    testID="login_button"
                    style={styles.otherButton}
                    onPress={this.handleLogin}
                    textStyle={styles.buttonText}
                >
                    Log in
                </Button>
                <Button
                    testID="login_to_password_button"
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_FORGOT_PASSWORD)}
                    textStyle={styles.buttonText}
                >
                    Forgot your password?
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_SIGNUP)}
                    textStyle={styles.buttonText}
                >
                    Create New Account
                </Button>
            </ScrollView>
        );
    }

    renderForgotPasswordScreen = () => {
        const {
            email,
        } = this.state;
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
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                <TextInput
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor={COLOR_WHITE}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.legalText}>
                    * We will send you an email to reset your password
                </Text>
                <Button
                    isDisabled={email.length < 6}
                    style={styles.otherButton}
                    onPress={this.handlePassReset}
                    textStyle={styles.buttonText}
                >
                    Send Reset Email
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={styles.buttonText}
                >
                    Back to login
                </Button>
            </ScrollView>
        );
    }

    render() {
        const { auth } = this.props;
        const {
            loadingAuth,
            loadingNext,
            screen,
        } = this.state;
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
                {
                    !isLoaded(auth) || loadingAuth || loadingNext
                        ? <LoadingIcon />
                        : content
                }
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        auth: state.firebase.auth,
        navigation: ownProps.navigation,
        profile: state.firebase.profile,
    }
);

const enhance = compose(
    withNamespaces('login'),
    firebaseConnect(),
    connect(
        mapStateToProps,
    ),
);

export default enhance(_Login);
