// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded } from 'react-redux-firebase';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';
import Button from 'apsl-react-native-button';
import { MessageBarManager } from 'react-native-message-bar';
import * as Progress from 'react-native-progress';
import ConfirmationModal from '../common/ConfirmationModal';
import Levels from '../Levels';
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_RED_OVERLAY,
    COLOR_WHITE,
} from '../constants';

const GLOBAL = require('../Globals');

/* eslint-disable global-require */

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 13,
        color: COLOR_DEEP_BLUE,
        fontWeight: '700',
    },
    container: {
        alignItems: 'center',
        width: GLOBAL.SCREEN_WIDTH,
    },
    otherButton: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 30,
        padding: Platform.OS === 'ios' ? 0 : 12,
        marginTop: 10,
        borderWidth: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 5,
        borderTopWidth: 0.5,
        borderBottomWidth: 0,
        borderColor: COLOR_LIGHT_GRAY,
        backgroundColor: COLOR_WHITE,
        width: GLOBAL.SCREEN_WIDTH,
    },
    barRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 0.5,
        borderBottomWidth: 0,
        borderColor: COLOR_LIGHT_GRAY,
        width: GLOBAL.SCREEN_WIDTH,
    },
    pic: {
        height: 150,
        width: 150,
        marginTop: -75,
    },
    info: {
        width: GLOBAL.SCREEN_WIDTH > 400 ? 400 : GLOBAL.SCREEN_WIDTH,
        flexDirection: 'row',
        height: 100,
        marginTop: -40,
        marginBottom: -30,
        backgroundColor: 'transparent',
    },
    infoLeft: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 20,
        left: 0,
        fontSize: 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoRight: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 20,
        fontSize: 10,
        right: 20,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoLeftTitle: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    infoRightTitle: {
        width: 100,
        height: 50,
        position: 'absolute',
        top: 0,
        right: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
});

type MOProps = {
    auth: Object,
    firebase: Object,
    kmTillNextLevel: number,
    level: number,
    navigation: NavigationProp,
    profile: Object,
    progress: number,
}

// eslint-disable-next-line react/prefer-stateless-function
class _MoreOptions extends React.Component<MOProps> {
    deleteUserAccount = () => {
        const { firebase, navigation } = this.props;

        const user = firebase.auth().currentUser;
        // stop listening for changes on the user's profile
        // as this causes a crash when the profile is deleted
        firebase.database().ref().child(`v2/users/${user.uid}`).off('value');
        user.delete().then(() => {
            // account deleted
            MessageBarManager.showAlert({
                title: 'Account deleted!',
                message: 'Sorry to see you go...',
                alertType: 'info',
            });
            navigation.navigate('Login');
        }).catch(() => {
            // the users has authenticated too long ago
            // ask them to reauthenticate to make sure
            // it's them
            MessageBarManager.showAlert({
                title: 'Could not delete!',
                message: 'Please login again to confirm you want to delete your account',
                alertType: 'error',
            });
            navigation.navigate('Login');
        });
    }

    deleteAccountConfirmationModal: ?React.ComponentType<ConfirmationModal>;

    renderDeleteAccountConfirmationModal = () => {
        const content = (
            <Text>
                Are you sure you want to delete your account?
                {'\n'}
                You will lose all of your progress and badges.
                Your contributions will remain public but no longer tied to your account.
                You will receive no confirmation email of account deletion.
                {'\n'}
                Would you like to continue?
            </Text>
        );

        return (
            <ConfirmationModal
                // $FlowFixMe
                cancelButtonCallback={() => { this.deleteAccountConfirmationModal.close(); }}
                cancelButtonText="No, Keep my account"
                content={content}
                // $FlowFixMe
                exitButtonCallback={this.deleteUserAccount}
                exitButtonText="Yes, delete it!"
                getRef={(r) => { this.deleteAccountConfirmationModal = r; }}
            />
        );
    }

    render() {
        const {
            auth,
            firebase,
            kmTillNextLevel,
            level,
            navigation,
            profile,
            progress,
        } = this.props;
        const levelObject = Levels[level];
        const contributions = isLoaded(profile)
            && Object.prototype.hasOwnProperty.call(profile, 'taskContributionCount') ? profile.taskContributionCount : 0;
        const deleteAccountConfirmationModal = this.renderDeleteAccountConfirmationModal();

        return (
            <ScrollView contentContainerStyle={styles.container}>
                {deleteAccountConfirmationModal}
                <ScrollingBackground />
                <Image style={styles.pic} key={level} source={levelObject.badge} />
                <View style={styles.info}>
                    <Text style={styles.infoLeftTitle}>
                    Level
                        {' '}
                        {level}
                    </Text>
                    <Text style={styles.infoRightTitle}>
                        {auth.displayName}
                    </Text>
                    <Text style={styles.infoLeft}>
                        {levelObject.title}
                    </Text>
                    <Text style={styles.infoRight}>
                    You&apos;ve completed
                        {' '}
                        {contributions}
                        {' '}
                        tasks!
                    </Text>
                </View>
                <LevelProgress
                    kmTillNextLevel={kmTillNextLevel}
                    progress={progress}
                />
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'http://mapswipe.org/faq',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
Frequently Asked
                    Questions
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'https://docs.google.com/forms/d/e/1FAIpQLSepCAnr7Jzwc77NsJYjdl4wBOSl8A9J3k-uJUPPuGpHP50LnA/viewform',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
Contact Us
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'http://missingmaps.org/events',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
Events
                    </Button>
                </View>

                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'http://missingmaps.org/blog',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
Blog
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            firebase.logout();
                            navigation.navigate('Login');
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        Sign Out
                    </Button>
                </View>
                <View style={[styles.row, { backgroundColor: COLOR_RED_OVERLAY }]}>
                    <Button
                        // $FlowFixMe
                        onPress={() => { this.deleteAccountConfirmationModal.open(); }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        Delete my account
                    </Button>
                </View>
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        auth: state.firebase.auth,
        kmTillNextLevel: state.ui.user.kmTillNextLevel,
        level: state.ui.user.level,
        navigation: ownProps.navigation,
        profile: state.firebase.profile,
        progress: state.ui.user.progress,
    }
);

const enhance = compose(
    firebaseConnect(),
    connect(mapStateToProps),
);

export default enhance(_MoreOptions);

type SBState = {
    offset: number,
};

// eslint-disable-next-line react/no-multi-comp
class ScrollingBackground extends React.Component<{}, SBState> {
    constructor(props: {}) {
        super(props);
        this.state = { offset: 0 };
        this.nextOffset = 2;
    }

    componentDidMount() {
        const self = this;
        this.bgInterval = setInterval(self.tick, 1000 / 50);
    }

    componentWillUnmount() {
        clearInterval(this.bgInterval);
    }

    backgroundImage = () => {
        const { offset } = this.state;
        if (offset > 950) {
            this.nextOffset = -1;
        } else if (offset < -950) {
            this.nextOffset = 1;
        }
        return (
            <Image
                source={require('./assets/map_new.jpg')}
                style={{
                    resizeMode: 'cover',
                    marginRight: offset,
                    height: 200,
                    backgroundColor: COLOR_LIGHT_GRAY,
                }}
            />
        );
    }

    tick = () => {
        let { offset } = this.state;
        offset += this.nextOffset;
        this.setState({ offset });
    }

    bgInterval: IntervalID;

    nextOffset: number;

    render() {
        return (
            this.backgroundImage()
        );
    }
}

const progressStyle = StyleSheet.create({
    text: {
        color: COLOR_WHITE,
        borderColor: COLOR_DARK_GRAY,
        fontWeight: '500',
        position: 'absolute',
        width: GLOBAL.SCREEN_WIDTH,
        left: 0,
        textAlign: 'center',
        paddingTop: 5,
    },
});

type LPProps = {
    kmTillNextLevel: number,
    progress: number,
};

const LevelProgress = (props: LPProps) => {
    let { kmTillNextLevel } = props;
    const { progress } = props;
    if (Number.isNaN(kmTillNextLevel)) {
        kmTillNextLevel = 0;
    }
    const swipes = Math.ceil(kmTillNextLevel / 6);
    const sqkm = kmTillNextLevel.toFixed(0);
    return (
        <View style={styles.barRow}>
            <Progress.Bar
                borderRadius={0}
                borderWidth={0}
                color={COLOR_DEEP_BLUE}
                height={30}
                progress={Number.isNaN(progress) ? 0 : progress}
                unfilledColor="#bbbbbb"
                width={GLOBAL.SCREEN_WIDTH}
            />
            <Text style={progressStyle.text}>
                {`${sqkm} tasks (${swipes} swipes) until the next level`}
            </Text>
        </View>
    );
};
