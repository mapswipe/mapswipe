// @flow
/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded } from 'react-redux-firebase';
import fb from '@react-native-firebase/app';
import { withTranslation } from 'react-i18next';
import {
    Alert,
    Linking,
    Text,
    View,
    ScrollView,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import { MessageBarManager } from 'react-native-message-bar';
import debugInfo from '../../../debugInfo';
import ConfirmationModal from '../common/ConfirmationModal';
import Levels from '../Levels';
import LevelProgress from '../common/LevelProgress';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_RED_OVERLAY,
    COLOR_WHITE,
} from '../constants';
import Button from '../common/Button';

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
        padding: 0,
        margin: 5,
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
    t: TranslationFunction,
    teamId: ?string,
    teamName: ?string,
};

// eslint-disable-next-line react/prefer-stateless-function
class _MoreOptions extends React.Component<MOProps> {
    deleteAccountConfirmationModal: ?React.ComponentType<ConfirmationModal>;

    componentDidMount() {
        fb.analytics().logEvent('screen_account');
    }

    deleteUserAccount = () => {
        const { firebase, navigation, t } = this.props;

        const user = firebase.auth().currentUser;
        fb.analytics().logEvent('delete_account');
        // stop listening for changes on the user's profile
        // as this causes a crash when the profile is deleted
        firebase.database().ref().child(`v2/users/${user.uid}`).off('value');
        user.delete()
            .then(() => {
                // account deleted
                MessageBarManager.showAlert({
                    title: t('Account deleted!'),
                    message: t('Sorry to see you go...'),
                    alertType: 'info',
                });
                navigation.navigate('LoginNavigator');
            })
            .catch(() => {
                // the users has authenticated too long ago
                // ask them to reauthenticate to make sure
                // it's them
                MessageBarManager.showAlert({
                    title: t('Could not delete!'),
                    message: t(
                        'Please login again to confirm you want to delete your account',
                    ),
                    alertType: 'error',
                });
                navigation.navigate('LoginNavigator');
            });
    };

    showDebugInfo = () => {
        // a simple alert box that shows the git tag and hash to help
        // with bug reporting
        // The values are written to a JSON file at build time in github actions
        Alert.alert(
            'Debugging info',
            `Version: ${debugInfo.gitTag}\nRevision: ${debugInfo.gitHash}`,
        );
    };

    renderDeleteAccountConfirmationModal = () => {
        const { t } = this.props;
        const content = (
            <>
                <Text style={{ fontSize: 28 }}>
                    {t('delete account question')}
                </Text>
                <Text>{t('delete account warning')}</Text>
            </>
        );

        return (
            <ConfirmationModal
                cancelButtonCallback={() => {
                    // $FlowFixMe
                    this.deleteAccountConfirmationModal.close();
                }}
                cancelButtonText={t('no keep my account')}
                content={content}
                // $FlowFixMe
                exitButtonCallback={this.deleteUserAccount}
                exitButtonText={t('yes delete it')}
                getRef={r => {
                    this.deleteAccountConfirmationModal = r;
                }}
            />
        );
    };

    render() {
        const {
            auth,
            firebase,
            kmTillNextLevel,
            level,
            navigation,
            profile,
            progress,
            t,
            teamId,
            teamName,
        } = this.props;
        const levelObject = Levels[level];
        const contributions =
            isLoaded(profile) &&
            Object.prototype.hasOwnProperty.call(
                profile,
                'taskContributionCount',
            )
                ? profile.taskContributionCount
                : 0;
        const deleteAccountConfirmationModal =
            this.renderDeleteAccountConfirmationModal();

        // determine the text to show on the level progress bar
        let kmTillNextLevelToShow = kmTillNextLevel;
        if (Number.isNaN(kmTillNextLevel)) {
            kmTillNextLevelToShow = 0;
        }
        const swipes = Math.ceil(kmTillNextLevelToShow / 6);
        const sqkm = kmTillNextLevelToShow.toFixed(0);
        const levelProgressText = t('x tasks (s swipes) until the next level', {
            sqkm,
            swipes,
        });

        return (
            <ScrollView contentContainerStyle={styles.container}>
                {deleteAccountConfirmationModal}
                <ScrollingBackground />
                <TouchableWithoutFeedback onLongPress={this.showDebugInfo}>
                    <Image
                        style={styles.pic}
                        key={level}
                        source={levelObject.badge}
                    />
                </TouchableWithoutFeedback>
                <View style={styles.info}>
                    <Text style={styles.infoLeftTitle}>
                        {t('Level X', { level })}
                    </Text>
                    <Text style={styles.infoRightTitle} numberOfLines={1}>
                        {auth.displayName}
                    </Text>
                    <Text style={styles.infoLeft}>{levelObject.title}</Text>
                    <Text style={styles.infoRight}>
                        {t('youve completed x tasks', { contributions })}
                    </Text>
                </View>
                <LevelProgress progress={progress} text={levelProgressText} />
                {teamId && (
                    <View style={styles.row}>
                        <Text
                            style={[
                                styles.buttonText,
                                { height: 30, marginTop: 10 },
                            ]}
                        >
                            {t('yourTeam', { teamName })}
                        </Text>
                    </View>
                )}
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('LanguageSelectionScreen');
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('changeLanguage')}
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'https://mapswipe.org/',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('mapswipe website')}
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: 'https://www.missingmaps.org',
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('missingmaps website')}
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            Linking.openURL('mailto:info@mapswipe.org');
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('email us')}
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            navigation.push('UserGroupScreen');
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('user groups')}
                    </Button>
                </View>
                <View style={styles.row}>
                    <Button
                        onPress={() => {
                            fb.analytics().logEvent('sign_out');
                            firebase.logout().then(() => {
                                navigation.navigate('LoginNavigator');
                            });
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('sign out')}
                    </Button>
                </View>
                <View
                    style={[styles.row, { backgroundColor: COLOR_RED_OVERLAY }]}
                >
                    <Button
                        onPress={() => {
                            // $FlowFixMe
                            this.deleteAccountConfirmationModal.open();
                        }}
                        style={styles.otherButton}
                        textStyle={styles.buttonText}
                    >
                        {t('delete my account')}
                    </Button>
                </View>
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    auth: state.firebase.auth,
    kmTillNextLevel: state.ui.user.kmTillNextLevel,
    level: state.ui.user.level,
    navigation: ownProps.navigation,
    profile: state.firebase.profile,
    progress: state.ui.user.progress,
    teamId: state.ui.user.teamId,
    teamName: state.firebase.data.teamName,
});

const enhance = compose(
    withTranslation('profileScreen'),
    firebaseConnect(),
    connect(mapStateToProps),
);

export default (enhance(_MoreOptions): any);

type SBState = {
    offset: number,
};

// eslint-disable-next-line react/no-multi-comp
class ScrollingBackground extends React.Component<{}, SBState> {
    bgInterval: IntervalID;

    nextOffset: number;

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
    };

    tick = () => {
        let { offset } = this.state;
        offset += this.nextOffset;
        this.setState({ offset });
    };

    render() {
        return this.backgroundImage();
    }
}
