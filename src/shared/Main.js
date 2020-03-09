// @flow
import * as React from 'react';
import {
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import fb from 'react-native-firebase';
import Button from 'apsl-react-native-button';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Login from './views/Login';
import AppLoadingScreen from './views/AppLoadingScreen';
import BuildingFootprintScreen from './views/BuildingFootprint';
import ChangeDetectionScreen from './views/ChangeDetection';
import Mapper from './views/Mapper';
import ProjectNav from './views/ProjectNav';
import WelcomeScreen from './views/Welcome';
import WebviewWindow from './views/WebviewWindow';
import {
    COLOR_DEEP_BLUE,
} from './constants';

const MessageBarAlert = require('react-native-message-bar').MessageBar;
const { MessageBarManager } = require('react-native-message-bar');
const Modal = require('react-native-modalbox');

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

type State = {
    isDisabled: bool,
    level: number,
    levelObject: Object,
};

class Main extends React.Component<{}, State> {
    alert: ?React.ComponentType<{}>;

    checkInterval: IntervalID;

    modal3: ?Modal;

    constructor(props: {}) {
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
    componentDidMount() {
        const parent = this;
        fb.analytics().logEvent('mapswipe_open');
        MessageBarManager.registerMessageBar(parent.alert);

        parent.checkInterval = setInterval(() => {
            if (GLOBAL.DB.getPendingLevelUp() > 0) {
                parent.openModal3(GLOBAL.DB.getPendingLevelUp());
                GLOBAL.DB.setPendingLevelUp(-1);
            }
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.checkInterval);
    }

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
                        ref={(r) => { this.modal3 = r; }}
                        isDisabled={isDisabled}
                    >
                        <Text style={style.header}>
                            {`You are now level ${level}`}
                        </Text>
                        <Image style={style.pic} key={level} source={levelObject.badge} />
                        <Button
                            style={style.startButton}
                            onPress={this.closeModal3}
                            textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                        >
                            Close
                        </Button>
                    </Modal>
                    <MessageBarAlert ref={(r) => { this.alert = r; }} />
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
 * - LoginNavigator is not logged in (it first tries the WelcomeScreen if it's the
 *   first time we're using the app, otherwise --> Login
 * - MainNavigator if logged in, and the rest of the app happens in there.
 */

const LoginNavigator = createStackNavigator(
    {
        Login,
        WebviewWindow,
        WelcomeScreen,
    },
    {
        initialRouteName: 'WelcomeScreen',
        headerMode: 'none',
    },
);

const MainNavigator = createStackNavigator(
    {
        BuildingFootprintScreen,
        ChangeDetectionScreen,
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

const StartNavigator = createAppContainer(createSwitchNavigator(
    {
        AppLoadingScreen,
        LoginNavigator,
        MainNavigator,
    },
    {
        initialRouteName: 'AppLoadingScreen',
    },
));

module.exports = Main;
