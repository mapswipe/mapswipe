// @flow
import React from 'react';
import {
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import fb from '@react-native-firebase/app';
// import type { Notification } from 'react-native-firebase';
import Button from 'apsl-react-native-button';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { withTranslation } from 'react-i18next';
import Modal from 'react-native-modalbox';
import Login from './views/Login';
import AppLoadingScreen from './views/AppLoadingScreen';
import BuildingFootprintScreen from './views/BuildingFootprint';
import BFInstructionsScreen from './views/BuildingFootprint/InstructionsScreen';
import ChangeDetectionScreen from './views/ChangeDetection';
import CDInstructionsScreen from './views/ChangeDetection/InstructionsScreen';
import LanguageSelectionScreen from './common/LanguageSelectionScreen';
import LanguageSelectionSplashScreen from './common/LanguageSelectionSplashScreen';
import Mapper from './views/Mapper';
import ProjectNav from './views/ProjectNav';
import WelcomeScreen from './views/Welcome';
import WebviewWindow from './views/WebviewWindow';
import { COLOR_DEEP_BLUE } from './constants';

const MessageBarAlert = require('react-native-message-bar').MessageBar;
const { MessageBarManager } = require('react-native-message-bar');

const ProjectView = require('./views/ProjectView');
const GLOBAL = require('./Globals');

const style = StyleSheet.create({
    startButton: {
        backgroundColor: '#ff0000',
        alignItems: 'stretch',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 260,
    },
    safeArea: {
        flex: 1,
        backgroundColor: COLOR_DEEP_BLUE,
    },
    pic: {
        height: 150,
        width: 150,
    },
    mainContainer: {
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
        flex: 1,
    },
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    modal: {
        padding: 20,
    },
    modal3: {
        marginTop: 10,
        height: 300,
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        alignItems: 'center',
    },
});

type Props = {
    i18n: Object,
    languageCode: string,
};

type State = {
    isDisabled: boolean,
    level: number,
    levelObject: Object,
};

class Main extends React.Component<Props, State> {
    alert: ?React.Component<{}>;

    checkInterval: IntervalID;

    // $FlowFixMe
    modal3: ?Modal;

    removeNotificationListener: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            isDisabled: false,
            level: GLOBAL.DB.getLevel(),
            levelObject: GLOBAL.DB.getLevelObject(),
        };
    }

    /**
     * Starts the level up timer and register the notification bar
     */
    async componentDidMount() {
        const parent = this;
        const { i18n, languageCode } = this.props;
        // setup Firebase Notifications so we can receive them
        // A channel is required for android 8+
        /*
         * Disable notifications while we upgrade to RNFirebase v6
         * as the package has been extracted from the main repo
         * so we need to find an alternative library to support this
         * As the upgrade process is already super messy, I'm turning
         * this off temporarily to be able to complete something.
         *
         * More info: https://rnfirebase.io/migrating-to-v6#notifications
         *
        const channel = new fb.notifications.Android.Channel(
            'main_channel',
            'mapswipe main channel',
            fb.notifications.Android.Importance.Max,
        ).setDescription('MapSwipe Notifications');
        fb.notifications().android.createChannel(channel);
        // check if the user has allowed receiving notifications
        fb.messaging()
            .hasPermission()
            .then(enabled => {
                if (enabled) {
                    // user has already given permission to notifications
                    parent.getNotificationToken();
                } else {
                    // user hasn't granted permission yet, let's request it
                    parent.requestNotificationsPermission();
                }
            });

        this.removeNotificationListener = fb
            .notifications()
            .onNotification((notif: Notification) => {
                console.log('notif received', notif);
                notif.android.setChannelId('main_channel').setSound('default');
                fb.notifications().displayNotification(notif);
            });
        */
        fb.analytics().logEvent('mapswipe_open');
        MessageBarManager.registerMessageBar(parent.alert);

        // set the app language from the language code loaded from redux
        // which has been restored from persistent storage by now
        i18n.changeLanguage(languageCode);

        parent.checkInterval = setInterval(() => {
            if (GLOBAL.DB.getPendingLevelUp() > 0) {
                parent.openModal3(GLOBAL.DB.getPendingLevelUp());
                GLOBAL.DB.setPendingLevelUp(-1);
            }
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.checkInterval);
        /*
         * See comment above about notifications
         */
        //this.removeNotificationListener();
    }

    // eslint-disable-next-line class-methods-use-this
    /*async getNotificationToken() {
        const fcmToken = await fb.messaging().getToken();
        if (__DEV__) {
            console.log('FCM token', fcmToken);
        }
    }

    async requestNotificationsPermission() {
        try {
            await fb.messaging().requestPermission();
            this.getNotificationToken();
        } catch (error) {
            console.log('permission to receive notifications rejected');
        }
    }*/

    openModal3(level: number) {
        this.setState({
            levelObject: GLOBAL.DB.getCustomLevelObject(level),
            level,
        });
        if (this.modal3) {
            this.modal3.open();
        }
    }

    closeModal3() {
        // $FlowFixMe
        this.modal3.close();
    }

    render() {
        const { isDisabled, level, levelObject } = this.state;
        return (
            <SafeAreaView style={style.safeArea}>
                <StatusBar
                    backgroundColor={COLOR_DEEP_BLUE}
                    barStyle="light-content"
                />
                <View style={style.mainContainer}>
                    <StartNavigator />
                    <Modal
                        style={[style.modal, style.modal3]}
                        backdropType="blur"
                        position="center"
                        ref={r => {
                            this.modal3 = r;
                        }}
                        isDisabled={isDisabled}
                    >
                        <Text style={style.header}>
                            {`You are now level ${level}`}
                        </Text>
                        <Image
                            style={style.pic}
                            key={level}
                            source={levelObject.badge}
                        />
                        <Button
                            style={style.startButton}
                            onPress={this.closeModal3}
                            textStyle={{
                                fontSize: 13,
                                color: '#ffffff',
                                fontWeight: '700',
                            }}
                        >
                            Close
                        </Button>
                    </Modal>
                    <MessageBarAlert
                        ref={r => {
                            this.alert = r;
                        }}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

/*
 * We use 3 navigators for the app:
 * StartNavigator just loads the AppLoadingScreen that shows nothing
 * but loads firebase auth and the redux store, while being hidden behind
 * the splashscreen. Once ready, it hands over to one of the other two,
 * depending on the auth status:
 * - LoginNavigator if not logged in (it first tries the WelcomeScreen if it's the
 *   first time we're using the app, otherwise --> Login
 * - MainNavigator if logged in, and the rest of the app happens in there.
 */

const LoginNavigator = createStackNavigator(
    {
        LanguageSelectionScreen,
        LanguageSelectionSplashScreen,
        Login,
        WebviewWindow,
        WelcomeScreen,
    },
    {
        initialRouteName: 'LanguageSelectionSplashScreen',
        headerMode: 'none',
    },
);

const MainNavigator = createStackNavigator(
    {
        BuildingFootprintScreen,
        BFInstructionsScreen,
        ChangeDetectionScreen,
        CDInstructionsScreen,
        LanguageSelectionScreen,
        ProjectNav,
        ProjectView,
        Mapper,
        WebviewWindow,
    },
    {
        initialRouteName: 'ProjectNav',
        headerMode: 'none',
        navigationOptions: {
            gesturesEnabled: false,
        },
    },
);

const StartNavigator = createAppContainer(
    createSwitchNavigator(
        {
            AppLoadingScreen,
            LoginNavigator,
            MainNavigator,
        },
        {
            initialRouteName: 'AppLoadingScreen',
        },
    ),
);

const mapStateToProps = state => ({
    languageCode: state.ui.user.languageCode,
});

export default (withTranslation()(connect(mapStateToProps)(Main)): any);
