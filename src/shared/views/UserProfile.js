// @flow
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
// $FlowIssue[cannot-resolve-module]
import { gql, useQuery } from '@apollo/client';
import auth, { firebase } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import analytics from '@react-native-firebase/analytics';
import {
    Alert,
    View,
    StyleSheet,
    Image,
    Text,
    ScrollView,
    Linking,
    RefreshControl,
    TouchableWithoutFeedback,
} from 'react-native';
import { MessageBarManager } from 'react-native-message-bar';
import { withTranslation } from 'react-i18next';
import ProgressBar from 'react-native-progress/Bar';
import { SvgXml } from 'react-native-svg';

import type {
    NavigationProp,
    TranslationFunction,
    UserGroupType,
} from '../flow-types';
import {
    COLOR_WHITE,
    COLOR_DEEP_BLUE,
    COLOR_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_SUCCESS_GREEN,
    COLOR_DARK_GRAY,
    COLOR_RED,
    FONT_WEIGHT_BOLD,
    FONT_SIZE_LARGE,
    FONT_SIZE_SMALL,
    SPACING_EXTRA_SMALL,
    SPACING_SMALL,
    SPACING_MEDIUM,
    FONT_SIZE_MEDIUM,
    supportedLanguages,
    publicDashboardUrl,
} from '../constants';
import { database as databaseIcon, externalLink } from '../common/SvgIcons';
import Levels from '../Levels';
import InfoCard from '../common/InfoCard';
import CalendarHeatmap from '../common/CalendarHeatmap';
import ClickableListItem from '../common/ClickableListItem';
import debugInfo from '../../../debugInfo';

const USER_STATS = gql`
    query UserStats($userId: ID) {
        user(pk: $userId) {
            userId
            username
            contributionStats {
                taskDate
                totalSwipe
            }
            contributionTime {
                taskDate
                totalTime
            }
            organizationSwipeStats {
                organizationName
                totalSwipe
            }
            projectStats {
                area
                projectType
            }
            projectSwipeStats {
                projectType
                totalSwipe
            }
            stats {
                totalMappingProjects
                totalSwipe
                totalSwipeTime
            }
            statsLatest {
                totalSwipe
                totalSwipeTime
                totalUserGroup
            }
            userGeoContribution {
                totalContribution
            }
        }
    }
`;

const styles = StyleSheet.create({
    myProfileScreen: {
        height: '100%',
        backgroundColor: COLOR_LIGHT_GRAY,
    },

    header: {
        alignItems: 'center',
        backgroundColor: COLOR_DEEP_BLUE,
        display: 'flex',
        flexDirection: 'row',
        padding: SPACING_MEDIUM,
    },

    avatar: {
        alignSelf: 'flex-start',
        flexShrink: 0,
        height: 110,
        width: 110,
    },

    details: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING_MEDIUM,
        paddingVertical: SPACING_SMALL,
    },

    name: {
        fontWeight: FONT_WEIGHT_BOLD,
        color: COLOR_WHITE,
        fontSize: FONT_SIZE_LARGE,
    },

    progressDetails: {
        marginVertical: SPACING_SMALL,
    },

    textContainer: {
        flexDirection: 'row',
        marginVertical: SPACING_EXTRA_SMALL,
    },

    levelText: {
        flex: 1,
        flexWrap: 'wrap',
        fontWeight: FONT_WEIGHT_BOLD,
        color: COLOR_WHITE,
        fontSize: FONT_SIZE_SMALL,
    },

    progressText: {
        flex: 1,
        flexWrap: 'wrap',
        color: COLOR_WHITE,
        fontSize: FONT_SIZE_SMALL,
    },

    progressBar: {
        marginVertical: SPACING_EXTRA_SMALL,
    },

    content: {
        backgroundColor: COLOR_LIGHT_GRAY,
    },

    databaseIcon: {
        marginHorizontal: SPACING_SMALL,
    },

    cachedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING_MEDIUM,
        marginTop: SPACING_MEDIUM,
        justifyContent: 'flex-end',
    },

    infoText: {
        opacity: 0.5,
    },

    statsContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING_MEDIUM / 2,
    },

    card: {
        flexGrow: 1,
        minWidth: 140,
        flexBasis: '50%',
    },

    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headingText: {
        color: COLOR_DARK_GRAY,
        fontWeight: FONT_WEIGHT_BOLD,
        paddingVertical: SPACING_SMALL,
    },

    heatmapContainer: {
        padding: SPACING_MEDIUM,
    },

    moreStatsContainer: {
        padding: SPACING_MEDIUM,
    },

    userGroupsContainer: {
        padding: SPACING_MEDIUM,
    },

    noGroups: {
        marginBottom: SPACING_MEDIUM,
        opacity: 0.5,
    },

    settingsContainer: {
        padding: SPACING_MEDIUM,
    },

    joinGroupButtonText: {
        color: COLOR_BLUE,
    },

    deleteButtonText: {
        color: COLOR_RED,
    },

    infoContainer: {
        flexGrow: 1,
        padding: '4%',
    },
});

type UserGroupWithGroupId = UserGroupType & {
    groupId: string,
};

type OwnProps = {
    navigation: NavigationProp,
};

type ReduxProps = {
    level: number,
    kmTillNextLevel: number,
    languageCode: string,
    progress: number,
    profile: Object,
    navigation: Object,
    // teamName: string,
};

type InjectedProps = {
    t: TranslationFunction,
};

const mapStateToProps = (state, ownProps): ReduxProps => ({
    kmTillNextLevel: state.ui.user.kmTillNextLevel,
    languageCode: state.ui.user.languageCode,
    level: state.ui.user.level,
    navigation: ownProps.navigation,
    profile: state.firebase.profile,
    progress: state.ui.user.progress,

    // TODO
    // teamId: state.ui.user.teamId,
    // teamName: state.firebase.data.teamName,
});

function useIsFocused(navigation) {
    const [isFocused, setIsFocused] = React.useState(true);

    const handleFocus = React.useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = React.useCallback(() => {
        setIsFocused(false);
    }, []);

    React.useEffect(() => {
        const didFocusSubscription = navigation.addListener(
            'didFocus',
            handleFocus,
        );
        const didBlurSubscription = navigation.addListener(
            'didBlur',
            handleBlur,
        );

        return () => {
            didFocusSubscription.remove();
            didBlurSubscription.remove();
            setIsFocused(false);
        };
    }, [navigation, handleFocus, handleBlur]);

    return isFocused;
}

const enhance = compose(
    withTranslation('profileScreen'),
    firebaseConnect(),
    connect(mapStateToProps),
);

type Stat = {
    title: string,
    value: string,
    cached?: boolean,
};

type Props = OwnProps & ReduxProps & InjectedProps;

function UserProfile(props: Props) {
    const {
        navigation,
        level,
        t,
        kmTillNextLevel,
        languageCode,
        progress,
        profile,
    } = props;

    const isFocused = useIsFocused(navigation);

    const levelObject = Levels[level];
    const kmTillNextLevelToShow = kmTillNextLevel || 0;
    const swipes = Math.ceil(kmTillNextLevelToShow / 6);
    const sqkm = kmTillNextLevelToShow.toFixed(0);
    const levelProgressText = t('x tasks (s swipes) until the next level', {
        sqkm,
        swipes,
    });

    const currentUser = React.useMemo(() => auth().currentUser, [isFocused]);
    const userId = currentUser?.uid;

    const {
        data: userStatsData,
        loading: loadingUserStats,
        refetch: refetchUserStats,
    } = useQuery(USER_STATS, {
        skip: !userId,
        variables: {
            userId,
        },
        onError: error => {
            console.error(error);
            MessageBarManager.showAlert({
                title: t('Failed to load stats'),
                message: error.message,
                alertType: 'error',
            });
        },
    });

    const [userGroups, setUserGroups] = React.useState([]);
    (userGroups: UserGroupWithGroupId[]);

    const loadUserGroups = React.useCallback(() => {
        const db = database();

        const userGroupsOfUserQuery = db.ref(`v2/users/${userId}/userGroups/`);

        const handleGroupsOfUserLoad = async userGroupsSnapshot => {
            if (!userGroupsSnapshot.exists()) {
                setUserGroups([]);
                return;
            }

            try {
                const userGroupsOfUser = userGroupsSnapshot.val();
                const groupKeys = Object.keys(userGroupsOfUser);
                const promises = groupKeys.map(groupKey => {
                    return db.ref(`v2/userGroups/${groupKey}`).once('value');
                });

                const userGroupSnapshots = await Promise.all(promises);
                const userGroupsFromFirebase = userGroupSnapshots
                    .map(snapshot => ({
                        groupId: snapshot.key,
                        ...snapshot.val(),
                    }))
                    .filter(group => !!group.name);

                const newUserGroups = ((Object.values(
                    userGroupsFromFirebase,
                ): any): Array<UserGroupWithGroupId>);

                setUserGroups(newUserGroups);
            } catch (error) {
                console.error(error);
                MessageBarManager.showAlert({
                    title: t('Failed to group details'),
                    alertType: 'error',
                });
            }
        };

        userGroupsOfUserQuery.on('value', handleGroupsOfUserLoad, error => {
            console.error(error);
            MessageBarManager.showAlert({
                title: t('Failed to group details'),
                alertType: 'error',
            });
        });

        return () => {
            userGroupsOfUserQuery.off('value', handleGroupsOfUserLoad);
        };
    }, [userId]);

    const calendarHeatmapData = React.useMemo(() => {
        const contributionStats = userStatsData?.user?.contributionStats;
        if (!contributionStats) {
            return {};
        }

        const MAX_SWIPE_PER_DAY = 800;

        const contributionStatsMap = contributionStats.reduce((acc, val) => {
            acc[val.taskDate] = Math.min(1, val.totalSwipe / MAX_SWIPE_PER_DAY);
            return acc;
        }, {});

        return contributionStatsMap;
    }, [userStatsData?.user?.contributionStats]);

    React.useEffect(() => {
        loadUserGroups();
    }, [loadUserGroups]);

    const userStats: Stat[] = React.useMemo(() => {
        const numberFormatter = new Intl.NumberFormat();
        const tasksCompleted = numberFormatter.format(
            profile?.taskContributionCount ?? 0,
        );
        const projectContributions = numberFormatter.format(
            profile?.projectContributionCount ?? 0,
        );

        const swipeTime = numberFormatter.format(
            userStatsData?.user?.stats?.totalSwipeTime ?? 0,
        );

        const swipeAreaSum = userStatsData?.user?.projectStats?.reduce(
            (sum, stat) => sum + (stat.area ?? 0),
            0,
        );

        const swipeArea = numberFormatter.format(swipeAreaSum?.toFixed(2) ?? 0);

        const organizationsSupported = numberFormatter.format(
            userStatsData?.user?.organizationSwipeStats?.length ?? 0,
        );

        return [
            {
                title: t('Tasks Completed'),
                value: tasksCompleted,
                cached: false,
            },
            {
                title: t('Swipe Quality Score'),
                value: '-',
                cached: true,
            },
            {
                title: t('Total time spent swiping (min)'),
                value: swipeTime,
                cached: true,
            },
            {
                title: t('Cumulative area swiped (sq.km)'),
                value: swipeArea,
                cached: true,
            },
            {
                title: t('Mapping Missions'),
                value: projectContributions,
                cached: false,
            },
            {
                title: t('Organization(s) supported'),
                value: organizationsSupported,
                cached: true,
            },
        ];
    }, [profile, userStatsData]);

    const selectedLanguage = React.useMemo(
        () =>
            supportedLanguages.find(language => language.code === languageCode),
        [languageCode],
    );

    const handleExploreGroupClick = React.useCallback(() => {
        navigation.navigate('SearchUserGroup');
    }, [navigation]);

    const handleUserGroupClick = React.useCallback(
        (userGroupId?: string) => {
            navigation.navigate('UserGroup', { userGroupId });
        },
        [navigation],
    );

    const handleUserNameChangeClick = React.useCallback(() => {
        navigation.navigate('ChangeUserName');
    }, [navigation]);

    const handleLanguageClick = React.useCallback(() => {
        navigation.navigate('LanguageSelection');
    }, [navigation]);

    const handleDeleteAccountClick = React.useCallback(() => {
        Alert.alert(
            t('Delete Account?'),
            t(
                'Are you sure you want to delete you account? This action cannot be undone!',
            ),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('OK'),
                    onPress: () => {
                        analytics().logEvent('delete_account');
                        const user = auth().currentUser;
                        database()
                            .ref()
                            .child(`v2/users/${user.uid}`)
                            .off('value');
                        user.delete()
                            .then(() => {
                                MessageBarManager.showAlert({
                                    title: t('accountDeleted'),
                                    message: t('accountDeletedSuccessMessage'),
                                    alertType: 'info',
                                });
                                navigation.navigate('LoginNavigator');
                            })
                            .catch(() => {
                                MessageBarManager.showAlert({
                                    title: t('accountDeletionFailed'),
                                    message: t('accountDeletionFailedMessage'),
                                    alertType: 'error',
                                });
                                navigation.navigate('LoginNavigator');
                            });
                    },
                    style: 'destructive',
                },
            ],
        );
    }, [navigation]);

    const handleSignoutClick = React.useCallback(() => {
        Alert.alert(t('sign out'), t('Are you sure you want to sign out?'), [
            {
                text: t('Cancel'),
                style: 'cancel',
            },
            {
                text: t('OK'),
                onPress: () => {
                    analytics().logEvent('sign_out');
                    firebase.logout().then(() => {
                        navigation.navigate('LoginNavigator');
                    });
                },
                style: 'destructive',
            },
        ]);
    }, [navigation]);

    const handleResetPasswordClick = React.useCallback(() => {
        Alert.alert(
            t('Reset Password'),
            t(
                'An email will be sent to your account with the reset link. Are you sure you want to continue?',
            ),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('OK'),
                    onPress: () => {
                        auth().sendPasswordResetEmail(auth().currentUser.email);
                    },
                },
            ],
        );
    }, []);

    const handleMapSwipeWebsiteClick = React.useCallback(() => {
        navigation.push('WebviewWindow', {
            uri: 'https://mapswipe.org/',
        });
    }, [navigation]);

    const handleMissingMapsClick = React.useCallback(() => {
        navigation.push('WebviewWindow', {
            uri: 'https://www.missingmaps.org',
        });
    }, [navigation]);

    const handleMoreStatsClick = React.useCallback(() => {
        if (userId) {
            Linking.openURL(`${publicDashboardUrl}/user/${userId}/`);
        }
    }, [userId]);

    const handleEmailClick = React.useCallback(() => {
        Linking.openURL('mailto:info@mapswipe.org');
    }, []);

    const refreshPage = React.useCallback(() => {
        refetchUserStats();
        loadUserGroups();
    }, [refetchUserStats, loadUserGroups]);

    return (
        <View style={styles.myProfileScreen}>
            <View style={styles.header}>
                <TouchableWithoutFeedback
                    onLongPress={() => {
                        // a simple alert box that shows the git tag and hash to help
                        // with bug reporting
                        // The values are written to a JSON file at build time in github actions
                        Alert.alert(
                            'Debugging info',
                            `Version: ${debugInfo.gitTag}\nRevision: ${debugInfo.gitHash}`,
                        );
                    }}
                >
                    <Image
                        style={styles.avatar}
                        key={levelObject.title}
                        source={levelObject.badge}
                        accessibilityLabel={levelObject.title}
                    />
                </TouchableWithoutFeedback>
                <View style={styles.details}>
                    <Text style={styles.name}>{currentUser?.displayName}</Text>
                    <View style={styles.progressDetails}>
                        <View style={styles.textContainer}>
                            <Text style={styles.levelText}>
                                {`${t('Level X', { level })} (${
                                    levelObject.title
                                })`}
                            </Text>
                        </View>
                        <ProgressBar
                            style={styles.progressBar}
                            borderRadius={0}
                            borderWidth={0}
                            color={COLOR_SUCCESS_GREEN}
                            height={10}
                            progress={progress ?? 0}
                            unfilledColor={COLOR_WHITE}
                            width={null}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.progressText}>
                                {levelProgressText}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={loadingUserStats}
                        onRefresh={refreshPage}
                    />
                }
            >
                <View style={styles.cachedInfo}>
                    <SvgXml
                        style={styles.databaseIcon}
                        xml={databaseIcon}
                        height={FONT_SIZE_SMALL}
                    />
                    <Text style={styles.infoText}>
                        {t('Updated once everyday')}
                    </Text>
                </View>
                <View style={styles.statsContainer}>
                    {userStats.map(stat => (
                        <InfoCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            style={styles.card}
                            iconXml={stat.cached ? databaseIcon : undefined}
                        />
                    ))}
                </View>
                <View style={styles.heatmapContainer}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>
                            {t('contributionHeatmap')}
                        </Text>
                        <SvgXml
                            style={styles.databaseIcon}
                            xml={databaseIcon}
                            height={FONT_SIZE_SMALL}
                        />
                    </View>
                    <CalendarHeatmap data={calendarHeatmapData} />
                </View>
                <View style={styles.moreStatsContainer}>
                    <ClickableListItem
                        onPress={handleMoreStatsClick}
                        title={t('More Stats')}
                        hideChevronIcon
                        icon={
                            <SvgXml
                                height={FONT_SIZE_MEDIUM}
                                xml={externalLink}
                            />
                        }
                    />
                </View>
                <View style={styles.userGroupsContainer}>
                    <Text style={styles.headingText}>{t('userGroups')} </Text>
                    <View>
                        {userGroups?.map(userGroup => (
                            <ClickableListItem
                                key={userGroup.groupId}
                                name={userGroup.groupId}
                                title={
                                    userGroup.archivedAt || userGroup.archivedBy
                                        ? `${userGroup.name} (Archived)`
                                        : userGroup.name
                                }
                                onPress={handleUserGroupClick}
                            />
                        ))}
                        {userGroups?.length === 0 && (
                            <View style={styles.noGroups}>
                                <Text>{t('No groups yet')}</Text>
                            </View>
                        )}
                    </View>
                    <ClickableListItem
                        textStyle={styles.joinGroupButtonText}
                        onPress={handleExploreGroupClick}
                        title={t('exploreGroups')}
                        accessibilityLabel={t('exploreGroups')}
                        hideChevronIcon
                    />
                </View>
                <View style={styles.settingsContainer}>
                    <Text style={styles.headingText}>{t('settings')} </Text>
                    <ClickableListItem
                        onPress={handleUserNameChangeClick}
                        title={t('changeUserName')}
                    />
                    <ClickableListItem
                        onPress={handleResetPasswordClick}
                        title={t('Reset Password')}
                        hideChevronIcon
                    />
                    <ClickableListItem
                        onPress={handleLanguageClick}
                        title={t('language')}
                        icon={<Text>{selectedLanguage?.name}</Text>}
                    />
                    <ClickableListItem
                        onPress={handleSignoutClick}
                        title={t('sign out')}
                        hideChevronIcon
                    />
                    <ClickableListItem
                        onPress={handleDeleteAccountClick}
                        title={t('deleteAccount')}
                        textStyle={styles.deleteButtonText}
                        hideChevronIcon
                    />
                </View>
                <View style={styles.infoContainer}>
                    <ClickableListItem
                        onPress={handleMapSwipeWebsiteClick}
                        title={t('mapswipe website')}
                        hideChevronIcon
                        icon={
                            <SvgXml
                                height={FONT_SIZE_MEDIUM}
                                xml={externalLink}
                            />
                        }
                    />
                    <ClickableListItem
                        onPress={handleMissingMapsClick}
                        title={t('missingMaps')}
                        hideChevronIcon
                        icon={
                            <SvgXml
                                height={FONT_SIZE_MEDIUM}
                                xml={externalLink}
                            />
                        }
                    />
                    <ClickableListItem
                        onPress={handleEmailClick}
                        title={t('email')}
                        hideChevronIcon
                        icon={
                            <SvgXml
                                height={FONT_SIZE_MEDIUM}
                                xml={externalLink}
                            />
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
}

export default (enhance(UserProfile): any);
