/**
 * Created by wwadewitte on 7/11/16.
 */

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
    NetInfo,
    TextInput
} from "react-native";
import Button from "apsl-react-native-button";
const MessageBarManager = require('react-native-message-bar').MessageBarManager;
var GLOBAL = require('../Globals');
//var ProgressBar = require('react-native-progress-bar');

//var SplashScreen = require('@remobile/react-native-splashscreen');
var LoadingIcon = require('./LoadingIcon');


var styles = StyleSheet.create({

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
        color: '#ffffff'
    },
    text5: {
        width: GLOBAL.SCREEN_WIDTH * 0.90,
        marginTop: 10,
        textAlign: 'left',
        fontSize: 10,
        marginBottom: 10,
        color: '#ffffff'
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
        paddingLeft: 10
    }
})
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
            loading: false,
            screen: 0
        }
    }

    componentDidMount() {
    }

    _handleSignUp() {
      //GLOBAL.ANALYTICS.logEvent('account_screen_seen');
        var parent = this;
        if (this.state.username !== null && this.state.username.length < 3) {
          //GLOBAL.ANALYTICS.logEvent('account_creation_error_username');
            MessageBarManager.showAlert({
                title: "Error on sign up",
                message: "Your username must be 4 characters or more",
                alertType: 'error',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            return;
        }

        if (this.state.username !== null && this.state.username.indexOf("@") !== -1) {
          //GLOBAL.ANALYTICS.logEvent('account_creation_error_username');
            MessageBarManager.showAlert({
                title: "Error on sign up",
                message: "Your username can not be an email",
                alertType: 'error',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            return;
        }
        this.setState({
            loading: true
        });

        GLOBAL.DB.createAccount(this.state.email, this.state.username, this.state.password).then(data => {
            MessageBarManager.showAlert({
                title: "Success",
                message: "Welcome to Mapswipe, " + this.state.username,
                alertType: 'info',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            parent.setState({
                loading: false
            });
          //GLOBAL.ANALYTICS.logEvent('account_created');
            parent.props.navigation.push('ProjectNav');
        }).catch(error => {
          //GLOBAL.ANALYTICS.logEvent('account_creation_error_db');
            MessageBarManager.showAlert({
                title: "Error on sign up",
                message: error,
                alertType: 'error',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            parent.setState({
                loading: false
            })
        })

    }

    _switchScreens(screen) {
        this.setState({
            screen: screen
        });
    }

    _handleLogin = () => {

        this.setState({
            loading: true
        });
        var parent = this;
        GLOBAL.DB.signIn(this.state.email, this.state.password).then(data => {
            MessageBarManager.showAlert({
                title: "Success",
                message: "Welcome to Mapswipe, " + this.state.username,
                alertType: 'info',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            parent.setState({
                loading: false
            })
          //GLOBAL.ANALYTICS.logEvent('account_login');
            parent.props.navigation.push('ProjectNav');
        }).catch(error => {
            if (error.indexOf("deleted") !== -1) {
                error = "Invalid username or password";
            }
            MessageBarManager.showAlert({
                title: "Error on log in",
                message: error,
                alertType: 'error',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            parent.setState({
                loading: false
            })
        })

    }

    _handlePassReset() {

        this.setState({
            loading: true
        });
        var parent = this;
        GLOBAL.DB.resetPass(this.state.email).then(data => {

            MessageBarManager.showAlert({
                title: "Success",
                message: "Check your email",
                alertType: 'info',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            parent.setState({
                loading: false
            })
          //GLOBAL.ANALYTICS.logEvent('pass_reset_request');

        }).catch(error => {
            if (error.indexOf("deleted") !== -1) {
                error = "This email was not found.";
            }
            MessageBarManager.showAlert({
                title: "Error on reset pass",
                message: error,
                alertType: 'error',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            parent.setState({
                loading: false
            })
        })
    }

    /**
     * Render function. W want to keep state throughout the entire component, so it's all one big horrible convention for now.
     * @returns {XML}
     */
    render() {
        console.log('rendering login');
        var rows = [];

        if (this.state.screen === 0) {
            rows.push(<ScrollView style={styles.container} contentContainerStyle={{
                alignItems: 'center',
                width: GLOBAL.SCREEN_WIDTH,
                backgroundColor: '#0d1949',
                padding: 20,
            }}>
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />
                <Text style={styles.text4}>Enter your username (More than 4 characters)</Text>

                <TextInput
                    autoCorrect={false}
                    style={styles.textInput}
                    onChangeText={(text) => this.setState({ username: text })}
                    value={this.state.username}
                />

                <Text style={styles.text4}>Enter your email</Text>

                <TextInput
                    autoCorrect={false}
                    secureTextEntry={false}
                    style={styles.textInput}
                    onChangeText={(text) => this.setState({ email: text.replace(" ", "") })}
                    value={this.state.email}
                />
                <Text style={styles.text4}>Enter your password (More than 6 characters)</Text>

                <TextInput
                    autoCorrect={false}
                    secureTextEntry={true}
                    style={styles.textInput}
                    onChangeText={(text) => this.setState({ password: text })}
                />
                <Text style={styles.text5}>* All the mapping you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be shared with anyone.</Text>
                <Button style={styles.otherButton} onPress={this._handleSignUp}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                    Sign Up
                </Button>
                <Button style={styles.switchToLogin} onPress={() => {
                    this._switchScreens(1)
                }}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                    Log in to an existing account
                </Button>

            </ScrollView>)
        } else if (this.state.screen === 1) {
            rows.push(<ScrollView style={styles.container} contentContainerStyle={{
                alignItems: 'center',
                width: GLOBAL.SCREEN_WIDTH,
                backgroundColor: '#0d1949',
                padding: 20,
            }}>
                <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                <Text style={styles.text4}>Enter your email</Text>

                <TextInput
                    autoCorrect={false}
                    style={styles.textInput}
                    secureTextEntry={false}
                    onChangeText={(text) => this.setState({ email: text.replace(" ", "") })}
                    value={this.state.email}
                />
                <Text style={styles.text4}>Enter your password</Text>

                <TextInput
                    autoCorrect={false}
                    secureTextEntry={true}
                    style={styles.textInput}
                    onChangeText={(text) => this.setState({ password: text })}
                />
                <Text style={styles.text5}>* All the data you contribute to mapswipe is open and available to anyone.
                    Your username is public, but your email and password will never be shared with anyone. </Text>
                <Button style={styles.otherButton} onPress={this._handleLogin}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                    Log in
                </Button>
                <Button style={styles.switchToLogin} onPress={() => {
                    this._switchScreens(2)
                }}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                    Forgot your password?
                </Button>
                <Button style={styles.switchToLogin} onPress={() => {
                    this._switchScreens(0)
                }}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                    Create New Account
                </Button>

            </ScrollView>)
        } else if (this.state.screen === 2) {
            rows.push(
                <ScrollView style={styles.container} contentContainerStyle={{
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    backgroundColor: '#0d1949',
                    padding: 20,
                }}>
                    <Image style={styles.tutIcon2} source={require('./assets/loadinganimation.gif')} />

                    <Text style={styles.text4}>Enter your email</Text>

                    <TextInput
                        autoCorrect={false}
                        style={styles.textInput}
                        onChangeText={(text) => this.setState({ email: text.replace(" ", "") })}
                        value={this.state.email}
                    />
                    <Text style={styles.text5}>* We will send you an email to reset your password</Text>
                    <Button style={styles.otherButton} onPress={this._handlePassReset}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                        Send Reset Email
                    </Button>
                    <Button style={styles.switchToLogin} onPress={() => {
                        this._switchScreens(1)
                    }}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                        Back to login
                    </Button>


                </ScrollView>
            )
        }
      return (
        <View style={styles.container}>
          {
                this.state.loading === true ?  // We're loading

                    <LoadingIcon />
                    : rows

          }

        </View>
        )
    }
}

module.exports = Login;
