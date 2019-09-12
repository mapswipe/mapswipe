/**
 * Created by wwadewitte on 7/11/16.
 */

// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
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
import { MessageBarManager } from 'react-native-message-bar';
import reduxStore from '../store';
import convertProfileToV2Format from '../common/ProfileConversion';
import LoadingIcon from './LoadingIcon';
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
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
    text4: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        marginTop: 10,
        textAlign: 'left',
        fontSize: 13,
        marginBottom: 10,
        color: COLOR_WHITE,
    },
    text5: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        marginTop: 10,
        textAlign: 'left',
        fontSize: 10,
        marginBottom: 10,
        color: COLOR_WHITE,
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
    loading: boolean,
    screen: number
}

class _Login extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
            loading: true,
            screen: SCREEN_SIGNUP,
        };
        const that = this;
        reduxStore().firebaseAuthIsReady.then(() => that.setState({ loading: false }));
    }

    componentDidMount() {
        const { auth, navigation } = this.props;
        if (isLoaded(auth) && !isEmpty(auth)) {
            navigation.push('ProjectNav');
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { auth, navigation } = this.props;
        if (auth !== prevProps.auth) {
            if (isLoaded(auth) && !isEmpty(auth)) {
                navigation.push('ProjectNav');
            }
        }
    }

    handleSignUp = () => {
        // GLOBAL.ANALYTICS.logEvent('account_screen_seen');
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
            // GLOBAL.ANALYTICS.logEvent('account_creation_error_username');
            MessageBarManager.showAlert({
                title: 'Error on sign up',
                message: 'Your username must be 4 characters or more',
                alertType: 'error',
            });
            return;
        }

        if (username !== null && username.indexOf('@') !== -1) {
            // GLOBAL.ANALYTICS.logEvent('account_creation_error_username');
            MessageBarManager.showAlert({
                title: 'Error on sign up',
                message: 'Your username can not be an email',
                alertType: 'error',
            });
            return;
        }
        this.setState({
            loading: true,
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
                parent.setState({
                    loading: false,
                });
                // GLOBAL.ANALYTICS.logEvent('account_created');
                navigation.push('ProjectNav');
            })
            .catch((error) => {
                // GLOBAL.ANALYTICS.logEvent('account_creation_error_db');
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
                });
                parent.setState({
                    loading: false,
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
            loading: true,
        });
        const parent = this;
        firebase.login({ email, password }).then((userCredentials) => {
            MessageBarManager.showAlert({
                title: 'Success',
                message: `Welcome to Mapswipe, ${userCredentials.user.user.displayName}`,
                alertType: 'info',
            });
            // GLOBAL.ANALYTICS.logEvent('account_login');
            convertProfileToV2Format(firebase);
            parent.props.navigation.push('ProjectNav');
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
            });
            parent.setState({
                loading: false,
            });
        });
    }

    handlePassReset = () => {
        const {
            email,
        } = this.state;
        const { firebase } = this.props;
        this.setState({
            loading: true,
        });
        const parent = this;
        firebase.auth().sendPasswordResetEmail(email).then(() => {
            MessageBarManager.showAlert({
                title: 'Success',
                message: 'Check your email',
                alertType: 'info',
            });
            parent.setState({
                loading: false,
            });
            // GLOBAL.ANALYTICS.logEvent('pass_reset_request');
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
            });
            parent.setState({
                loading: false,
            });
        });
    }

    renderSignupScreen = () => {
        const { t } = this.props;
        const {
            email,
            username,
        } = this.state;
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
                <Text style={styles.text4}>{t('login:enterUsername')}</Text>

                <TextInput
                    testID="signup_username"
                    autoCorrect={false}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ username: text })}
                    value={username}
                />

                <Text style={styles.text4}>Enter your email</Text>

                <TextInput
                    testID="signup_email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    secureTextEntry={false}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.text4}>Enter your password (More than 6 characters)</Text>

                <TextInput
                    testID="signup_password"
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={text => this.setState({ password: text })}
                />
                <Text style={styles.text5}>
                    * All the mapping you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be
                    shared with anyone.
                </Text>
                <Button
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

                <Text style={styles.text4}>Enter your email</Text>
                <TextInput
                    testID="login_email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    style={styles.textInput}
                    secureTextEntry={false}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.text4}>Enter your password</Text>

                <TextInput
                    testID="login_password"
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={text => this.setState({ password: text })}
                />
                <Text style={styles.text5}>
                    * All the data you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be
                    shared with anyone.
                    {' '}
                </Text>
                <Button
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

                <Text style={styles.text4}>Enter your email</Text>
                <TextInput
                    autoCorrect={false}
                    keyboardType="email-address"
                    style={styles.textInput}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.text5}>* We will send you an email to reset your password</Text>
                <Button
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
            loading,
            screen,
        } = this.state;
        let content;

        if (screen === SCREEN_SIGNUP) {
            content = this.renderSignupScreen();
        } else if (screen === SCREEN_LOGIN) {
            content = this.renderLoginScreen();
        } else if (screen === SCREEN_FORGOT_PASSWORD) {
            content = this.renderForgotPasswordScreen();
        }

        return (
            <View style={styles.container}>
                {
                    !isLoaded(auth) || loading
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
