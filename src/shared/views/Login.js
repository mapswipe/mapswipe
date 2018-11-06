/**
 * Created by wwadewitte on 7/11/16.
 */

import React from 'react';
import { connect } from 'react-redux';
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

const GLOBAL = require('../Globals');
const LoadingIcon = require('./LoadingIcon');

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
    wrapper: {},
    container: {
        width: GLOBAL.SCREEN_WIDTH,
        height: GLOBAL.SCREEN_HEIGHT,
        backgroundColor: '#0d1949',
        flex: 1,
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
        paddingLeft: 10,
    },
});

// Screen constants
const SCREEN_SIGNUP = 0;
const SCREEN_LOGIN = 1;
const SCREEN_FORGOT_PASSWORD = 2;

class _Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
            loading: false,
            screen: SCREEN_SIGNUP,
        };
    }

    componentDidMount() {
        const { loggedIn, navigation } = this.props;
        if (loggedIn) {
            navigation.push('ProjectNav');
        }
    }

    componentDidUpdate(prevProps) {
        const { loggedIn, navigation } = this.props;
        if (loggedIn !== prevProps.loggedIn) {
            if (loggedIn) {
                navigation.push('ProjectNav');
            }
        }
    }

    handleSignUp = () => {
        // GLOBAL.ANALYTICS.logEvent('account_screen_seen');
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

        GLOBAL.DB.createAccount(email, username, password).then(() => {
            MessageBarManager.showAlert({
                title: 'Success',
                message: `Welcome to Mapswipe, ${username}`,
                alertType: 'info',
            });
            parent.setState({
                loading: false,
            });
            // GLOBAL.ANALYTICS.logEvent('account_created');
            parent.props.navigation.push('ProjectNav');
        }).catch((error) => {
            // GLOBAL.ANALYTICS.logEvent('account_creation_error_db');
            MessageBarManager.showAlert({
                title: 'Error on sign up',
                message: error,
                alertType: 'error',
            });
            parent.setState({
                loading: false,
            });
        });
    }

    switchScreens = (screen) => {
        this.setState({
            screen,
        });
    }

    handleLogin = () => {
        const {
            email,
            password,
            username,
        } = this.state;
        this.setState({
            loading: true,
        });
        const parent = this;
        GLOBAL.DB.signIn(email, password).then(() => {
            MessageBarManager.showAlert({
                title: 'Success',
                message: `Welcome to Mapswipe, ${username}`,
                alertType: 'info',
            });
            // GLOBAL.ANALYTICS.logEvent('account_login');
            parent.props.navigation.push('ProjectNav');
        }).catch((error) => {
            let errorMessage;
            if (error.indexOf('deleted') !== -1) {
                errorMessage = 'Invalid username or password';
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

    _handlePassReset() {
        const {
            email,
        } = this.state;
        this.setState({
            loading: true,
        });
        const parent = this;
        GLOBAL.DB.resetPass(email).then(() => {
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
            if (error.indexOf('deleted') !== -1) {
                errorMessage = 'This email was not found.';
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
        const {
            email,
            username,
        } = this.state;
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: '#0d1949',
                    padding: 20,
                }}
            >
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />
                <Text style={styles.text4}>Enter your username (More than 4 characters)</Text>

                <TextInput
                    autoCorrect={false}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ username: text })}
                    value={username}
                />

                <Text style={styles.text4}>Enter your email</Text>

                <TextInput
                    autoCorrect={false}
                    secureTextEntry={false}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.text4}>Enter your password (More than 6 characters)</Text>

                <TextInput
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={text => this.setState({ password: text })}
                />
                <Text style={styles.text5}>
* All the mapping you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be shared with anyone.
                </Text>
                <Button
                    style={styles.otherButton}
                    onPress={this.handleSignUp}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    Sign Up
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
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
                style={styles.container}
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: '#0d1949',
                    padding: 20,
                }}
            >
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                <Text style={styles.text4}>Enter your email</Text>
                <TextInput
                    autoCorrect={false}
                    style={styles.textInput}
                    secureTextEntry={false}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.text4}>Enter your password</Text>

                <TextInput
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={text => this.setState({ password: text })}
                />
                <Text style={styles.text5}>
* All the data you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be shared with anyone.
                    {' '}
                </Text>
                <Button
                    style={styles.otherButton}
                    onPress={this.handleLogin}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    Log in
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_FORGOT_PASSWORD)}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    Forgot your password?
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_SIGNUP)}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
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
                style={styles.container}
                contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: '#0d1949',
                    padding: 20,
                }}
            >
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                <Text style={styles.text4}>Enter your email</Text>
                <TextInput
                    autoCorrect={false}
                    style={styles.textInput}
                    onChangeText={text => this.setState({ email: text.replace(' ', '') })}
                    value={email}
                />
                <Text style={styles.text5}>* We will send you an email to reset your password</Text>
                <Button
                    style={styles.otherButton}
                    onPress={this.handlePassReset}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    Send Reset Email
                </Button>
                <Button
                    style={styles.switchToLogin}
                    onPress={() => this.switchScreens(SCREEN_LOGIN)}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    Back to login
                </Button>
            </ScrollView>
        );
    }

    render() {
        const { loggedIn } = this.props;
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
                    loggedIn === null || loading
                        ? <LoadingIcon />
                        : content
                }
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
        loggedIn: state.ui.auth.loggedIn,
    }
);

const mapDispatchToProps = dispatch => (
    {
        //onLogin: () => {
        //dispatch(loginAction());
        //},
    }
);

export const Login = connect(
    mapStateToProps,
    mapDispatchToProps,
)(_Login);


module.exports = Login;
