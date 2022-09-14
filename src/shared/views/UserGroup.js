// @flow
import React from 'react';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { MessageBarManager } from 'react-native-message-bar';
// $FlowIssue[cannot-resolve-module]
import { gql, useQuery } from '@apollo/client';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { SvgXml } from 'react-native-svg';

import { withTranslation } from 'react-i18next';
import {
    Alert,
    View,
    StyleSheet,
    ScrollView,
    Text,
    Button,
    RefreshControl,
    Linking,
} from 'react-native';
import {
    COLOR_LIGHT_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
    COLOR_SUCCESS_GREEN,
    COLOR_RED,
    SPACING_MEDIUM,
    FONT_WEIGHT_BOLD,
    FONT_SIZE_SMALL,
    SPACING_SMALL,
    COLOR_YELLOW_OVERLAY,
    FONT_SIZE_MEDIUM,
    publicDashboardUrl,
} from '../constants';
import PageHeader from '../common/PageHeader';
import { database as databaseIcon, externalLink } from '../common/SvgIcons';
import InfoCard from '../common/InfoCard';
import ClickableListItem from '../common/ClickableListItem';
import CalendarHeatmap from '../common/CalendarHeatmap';
import type { TranslationFunction } from '../flow-types';

const USER_GROUP_STATS = gql`
    query UserGroupStats($userGroupId: ID) {
        userGroup(pk: $userGroupId) {
            contributionStats {
                taskDate
                totalSwipe
            }
            description
            name
            isArchived
            userGroupId
            projectTypeStats {
                area
                projectType
            }
            stats {
                totalMappingProjects
                totalSwipe
                totalSwipeTime
            }
            userGroupOrganizationStats {
                organizationName
                totalSwipe
            }
        }
    }
`;

const styles = StyleSheet.create({
    userGroup: {
        height: '100%',
        backgroundColor: COLOR_LIGHT_GRAY,
    },

    noUserId: {
        flexGrow: 1,
        alignItems: 'center',
        padding: SPACING_MEDIUM,
    },

    loading: {
        flexGrow: 1,
        alignItems: 'center',
        padding: SPACING_MEDIUM,
    },

    header: {
        backgroundColor: COLOR_DEEP_BLUE,
        display: 'flex',
        justifyContent: 'center',
        padding: SPACING_MEDIUM,
    },

    headingText: {
        color: COLOR_DARK_GRAY,
        fontWeight: FONT_WEIGHT_BOLD,
        paddingVertical: SPACING_SMALL,
    },

    archivedInfo: {
        padding: SPACING_MEDIUM,
        backgroundColor: COLOR_YELLOW_OVERLAY,
    },

    content: {
        backgroundColor: COLOR_LIGHT_GRAY,
    },

    userGroupsStatsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
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

    heatmapContainer: {
        padding: SPACING_MEDIUM,
    },

    moreStatsContainer: {
        padding: SPACING_MEDIUM,
    },

    settingsContainer: {
        padding: SPACING_MEDIUM,
    },

    databaseIcon: {
        marginHorizontal: SPACING_SMALL,
    },

    cachedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING_MEDIUM,
        justifyContent: 'flex-end',
        marginTop: SPACING_MEDIUM,
    },

    infoText: {
        opacity: 0.5,
    },

    joinNewGroup: {
        margin: SPACING_MEDIUM,
    },

    leaveButtonText: {
        color: COLOR_RED,
    },
});

type Stat = {
    title: string,
    value: string,
    cached?: boolean,
};

type OwnProps = {
    navigation: {
        navigate: Function,
        state: {
            params: { userGroupId: string },
        },
    },
};

type InjectedProps = {
    t: TranslationFunction,
};

type Props = OwnProps & InjectedProps;

function UserGroup(props: Props) {
    const {
        navigation: {
            navigate,
            state: {
                params: { userGroupId },
            },
        },
        t,
    } = props;

    const [userGroupDetailPending, setUserGroupDetailPending] =
        React.useState(false);
    const [userGroupDetail, setUserGroupDetail] = React.useState();
    const userId = auth().currentUser?.uid;

    const {
        data: userGroupStatsData,
        loading: loadingUserGroupStats,
        refetch: refetchUserGroupStats,
    } = useQuery(USER_GROUP_STATS, {
        skip: !userGroupId,
        variables: {
            userGroupId,
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

    React.useEffect(() => {
        if (!userGroupId) {
            return undefined;
        }

        const handleUserGroupDetailLoad = snapshot => {
            if (snapshot.exists()) {
                const userGroup = snapshot.val();
                setUserGroupDetail(userGroup);
            }
            setUserGroupDetailPending(false);
        };

        setUserGroupDetailPending(true);
        const groupDetailEndpoint = `/v2/userGroups/${userGroupId}/`;
        const groupDetailRef = database().ref(groupDetailEndpoint);

        groupDetailRef.on('value', handleUserGroupDetailLoad);

        return () => {
            groupDetailRef.off('value', handleUserGroupDetailLoad);
            setUserGroupDetailPending(false);
        };
    }, []);

    const handleLeaveUserGroupClick = React.useCallback(() => {
        Alert.alert(
            t('Leave User Group'),
            `${t('Are you sure you want to leave this group?')}\n\n${t(
                'After you leave the group, you will still remain on the leaderboard. Contributions you made while a member of the group will still be counted towards the group. Contributions after you leave will no longer be counted towards the group.',
            )}`,
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('OK'),
                    onPress: () => {
                        const updates = {};
                        database()
                            .ref('/v2/userGroupMembershipLogs/')
                            .push()
                            .then(
                                logId => {
                                    if (logId) {
                                        updates[
                                            `/v2/users/${userId}/userGroups/${userGroupId}`
                                        ] = null;
                                        updates[
                                            `/v2/userGroups/${userGroupId}/users/${userId}`
                                        ] = null;
                                        updates[
                                            `/v2/userGroupMembershipLogs/${logId.key}`
                                        ] = {
                                            userId,
                                            userGroupId,
                                            action: 'leave',
                                            timestamp: new Date().getTime(),
                                        };
                                        database()
                                            .ref()
                                            .update(
                                                updates,
                                                () => {
                                                    MessageBarManager.showAlert(
                                                        {
                                                            title: t(
                                                                'Usergroup left',
                                                            ),
                                                        },
                                                    );
                                                    navigate('UserProfile');
                                                },
                                                () => {
                                                    MessageBarManager.showAlert(
                                                        {
                                                            title: t(
                                                                'Failed to leave Usergroup',
                                                            ),
                                                            alertType: 'error',
                                                        },
                                                    );
                                                },
                                            );
                                    } else {
                                        MessageBarManager.showAlert({
                                            title: t(
                                                'Failed to leave Usergroup',
                                            ),
                                            alertType: 'error',
                                        });
                                        console.error(
                                            'Cannot get new key to push membership log',
                                        );
                                    }
                                },
                                () => {
                                    MessageBarManager.showAlert({
                                        title: t('Failed to leave Usergroup'),
                                        alertType: 'error',
                                    });
                                },
                            );
                    },
                },
            ],
        );
    }, [userId, userGroupId, navigate]);

    const handleJoinUserGroupClick = React.useCallback(() => {
        Alert.alert(
            t('Join User Group'),
            t('Are you sure you want to join this group?'),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('OK'),
                    onPress: () => {
                        const updates = {};
                        database()
                            .ref('/v2/userGroupMembershipLogs/')
                            .push()
                            .then(
                                logId => {
                                    if (logId) {
                                        updates[
                                            `/v2/users/${userId}/userGroups/${userGroupId}`
                                        ] = true;
                                        updates[
                                            `/v2/userGroups/${userGroupId}/users/${userId}`
                                        ] = true;
                                        updates[
                                            `/v2/userGroupMembershipLogs/${logId.key}`
                                        ] = {
                                            userId,
                                            userGroupId,
                                            action: 'join',
                                            timestamp: new Date().getTime(),
                                        };

                                        database()
                                            .ref()
                                            .update(
                                                updates,
                                                () => {
                                                    MessageBarManager.showAlert(
                                                        {
                                                            title: t(
                                                                'Usergroup joined',
                                                            ),
                                                        },
                                                    );
                                                },
                                                () => {
                                                    MessageBarManager.showAlert(
                                                        {
                                                            title: t(
                                                                'Failed to join Usergroup',
                                                            ),
                                                            alertType: 'error',
                                                        },
                                                    );
                                                },
                                            );
                                    } else {
                                        MessageBarManager.showAlert({
                                            title: t(
                                                'Failed to join Usergroup',
                                            ),
                                            alertType: 'error',
                                        });
                                        console.error(
                                            'Cannot get new key to push membership log',
                                        );
                                    }
                                },
                                () => {
                                    MessageBarManager.showAlert({
                                        title: t('Failed to join Usergroup'),
                                        alertType: 'error',
                                    });
                                },
                            );
                    },
                },
            ],
        );
    }, [userId, userGroupId]);

    const handleMoreStatsClick = React.useCallback(() => {
        if (userGroupId) {
            Linking.openURL(`${publicDashboardUrl}/user-group/${userGroupId}/`);
        }
    }, [userGroupId]);

    const userGroupStats: Stat[] = React.useMemo(() => {
        const numberFormatter = new Intl.NumberFormat();
        const stats = userGroupStatsData?.userGroup?.stats;

        const totalSwipeTime = numberFormatter.format(
            stats?.totalSwipeTime ?? 0,
        );
        const totalSwipes = numberFormatter.format(stats?.totalSwipe ?? 0);
        const mappingProjects = numberFormatter.format(
            stats?.totalMappingProjects ?? 0,
        );
        const membersCount =
            userGroupDetail && userGroupDetail.users
                ? numberFormatter.format(
                      Object.keys(userGroupDetail.users).length,
                  )
                : '-';

        const swipeAreaSum =
            userGroupStatsData?.userGroup?.projectTypeStats?.find(
                project => project.projectType === '1',
            )?.area;

        const swipeArea = numberFormatter.format(swipeAreaSum?.toFixed(2) ?? 0);

        const organizationsSupported = numberFormatter.format(
            userGroupStatsData?.userGroup?.userGroupOrganizationStats?.length ??
                0,
        );

        return [
            {
                title: t('Tasks Completed'),
                value: totalSwipes,
                cached: true,
            },
            {
                title: t('Members'),
                value: membersCount,
                cached: false,
            },
            {
                title: t('Total time spent swiping (min)'),
                value: totalSwipeTime,
                cached: true,
            },
            {
                title: t('Cumulative area swiped (sq.km)'),
                value: swipeArea,
                cached: true,
            },
            {
                title: t('Mapping Projects'),
                value: mappingProjects,
                cached: true,
            },
            {
                title: t('Organization(s) supported'),
                value: organizationsSupported,
                cached: true,
            },
        ];
    }, [userGroupDetail, userGroupStatsData]);

    const calendarHeatmapData = React.useMemo(() => {
        const contributionStats =
            userGroupStatsData?.userGroup?.contributionStats;

        if (!contributionStats) {
            return {};
        }

        const MAX_SWIPE_PER_DAY = 2200;

        const contributionStatsMap = contributionStats.reduce((acc, val) => {
            acc[val.taskDate] = Math.min(1, val.totalSwipe / MAX_SWIPE_PER_DAY);
            return acc;
        }, {});

        return contributionStatsMap;
    }, [userGroupStatsData?.userGroup?.contributionStats]);

    const isUserMember = !!userGroupDetail?.users?.[userId];
    const isGroupArchived =
        !!userGroupDetail?.archivedAt || !!userGroupDetail?.archivedBy;

    return (
        <View style={styles.userGroup}>
            <PageHeader
                style={styles.header}
                heading={userGroupDetail?.name ?? t('User group')}
                // description={userGroupDetail?.description}
            />
            {userGroupDetailPending && (
                <View style={styles.loading}>
                    <Text>{t('Loading group details...')}</Text>
                </View>
            )}
            {!userGroupDetailPending && !userGroupDetail && (
                <View style={styles.noUserId}>
                    <Text>
                        {t('Details not available for this User group')}
                    </Text>
                </View>
            )}
            {!userGroupDetailPending && userGroupDetail && (
                <>
                    {isGroupArchived && (
                        <View style={styles.archivedInfo}>
                            <Text>{t('This group has been archived')}</Text>
                        </View>
                    )}
                    <ScrollView
                        contentContainerStyle={styles.content}
                        refreshControl={
                            <RefreshControl
                                refreshing={
                                    userGroupDetailPending ||
                                    loadingUserGroupStats
                                }
                                onRefresh={refetchUserGroupStats}
                            />
                        }
                    >
                        {!isUserMember && !isGroupArchived && (
                            <View style={styles.joinNewGroup}>
                                <Button
                                    color={COLOR_SUCCESS_GREEN}
                                    onPress={handleJoinUserGroupClick}
                                    title={t('joinGroup')}
                                    accessibilityLabel={t('joinGroup')}
                                />
                            </View>
                        )}
                        <View style={styles.cachedInfo}>
                            <SvgXml
                                style={styles.databaseIcon}
                                xml={databaseIcon}
                                height={FONT_SIZE_SMALL}
                            />
                            <Text style={styles.infoText}>
                                {t('Updated once every day')}
                            </Text>
                        </View>
                        <View style={styles.userGroupsStatsContainer}>
                            {userGroupStats.map(stat => (
                                <InfoCard
                                    key={stat.title}
                                    title={stat.title}
                                    value={stat.value}
                                    style={styles.card}
                                    iconXml={
                                        stat.cached ? databaseIcon : undefined
                                    }
                                />
                            ))}
                        </View>
                        <View style={styles.heatmapContainer}>
                            <View style={styles.headingContainer}>
                                <Text style={styles.headingText}>
                                    {t('Contribution Heatmap')}
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
                        {isUserMember && (
                            <View style={styles.settingsContainer}>
                                <Text style={styles.headingText}>
                                    {t('settings')}
                                </Text>
                                <ClickableListItem
                                    textStyle={styles.leaveButtonText}
                                    onPress={handleLeaveUserGroupClick}
                                    title={t('leaveGroup')}
                                    accessibilityLabel={t('leaveGroup')}
                                    hideChevronIcon
                                />
                            </View>
                        )}
                    </ScrollView>
                </>
            )}
        </View>
    );
}

const enhance = compose(withTranslation('userGroupScreen'), firebaseConnect());
export default (enhance(UserGroup): any);
