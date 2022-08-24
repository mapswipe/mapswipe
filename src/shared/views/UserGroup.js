// @flow
import React from 'react';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
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
} from 'react-native';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
    COLOR_SUCCESS_GREEN,
    COLOR_RED,
    SPACING_MEDIUM,
    FONT_WEIGHT_BOLD,
    FONT_SIZE_LARGE,
    FONT_SIZE_SMALL,
    SPACING_SMALL,
    COLOR_YELLOW_OVERLAY,
} from '../constants';
import { database as databaseIcon } from '../common/SvgIcons';
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
            projectSwipeType {
                projectType
                totalSwipe
            }
            projectTypeStats {
                area
                projectType
            }
            stats {
                totalMappingProjects
                totalSwipe
                totalSwipeTime
            }
            userGroupGeoStats {
                totalContribution
            }
            userGroupLatest {
                totalContributors
                totalSwipeTime
                totalSwipes
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

    userGroupNameLabel: {
        fontWeight: FONT_WEIGHT_BOLD,
        color: COLOR_WHITE,
        fontSize: FONT_SIZE_LARGE,
    },

    membersLabel: {
        color: COLOR_LIGHT_GRAY,
        fontSize: FONT_SIZE_SMALL,
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

    heatmapContainer: {
        padding: SPACING_MEDIUM,
    },

    membersContainer: {
        padding: SPACING_MEDIUM,
    },

    leaderBoardItem: {
        backgroundColor: COLOR_WHITE,
        borderColor: COLOR_LIGHT_GRAY,
        borderBottomWidth: 1,
        padding: SPACING_MEDIUM,
    },

    userTitle: {
        color: COLOR_DARK_GRAY,
        fontSize: FONT_SIZE_SMALL,
    },

    settingsContainer: {
        padding: SPACING_MEDIUM,
    },

    databaseIcon: {
        marginRight: SPACING_SMALL,
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
            state: {
                params: { userGroupId },
            },
        },
        t,
    } = props;

    const [userGroupDetailPending, setUserGroupDetailPending] =
        React.useState(false);
    const [usersPending, setUsersPending] = React.useState(false);
    const [userGroupDetail, setUserGroupDetail] = React.useState();
    const [users, setUsers] = React.useState();
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

                if (userGroup.users) {
                    setUsersPending(true);
                    const userKeys = Object.keys(userGroup.users);
                    const promises = userKeys.map(userKey => {
                        return database()
                            .ref(`v2/users/${userKey}`)
                            .once('value');
                    });

                    Promise.all(promises).then(snapshots => {
                        const userList = snapshots.map(userSnapshot =>
                            userSnapshot.val(),
                        );
                        setUsers(userList);
                        setUsersPending(false);
                    });
                }
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

    const handleLeaveUserGroup = React.useCallback(() => {
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
                        updates[`/v2/userGroupMembershipLogs/${logId.key}`] = {
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
                                    console.info('Usergroup left');
                                },
                                () => {
                                    console.error('Failed to leave Usergroup');
                                },
                            );
                    } else {
                        console.error(
                            'Cannot get new key to push membership log',
                        );
                    }
                },
                () => {
                    console.error('Failed to leave Usergroup');
                },
            );
    }, [userId, userGroupId]);

    const handleJoinUserGroup = React.useCallback(() => {
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
                        updates[`/v2/userGroupMembershipLogs/${logId.key}`] = {
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
                                    console.info('Usergroup joined');
                                },
                                () => {
                                    console.error('Failed to join Usergroup');
                                },
                            );
                    } else {
                        console.error(
                            'Cannot get new key to push membership log',
                        );
                    }
                },
                () => {
                    console.error('Failed to join Usergroup');
                },
            );
    }, [userId, userGroupId]);

    const userGroupStats: Stat[] = React.useMemo(() => {
        const stats = userGroupStatsData?.userGroup?.stats;
        const totalSwipeTime = stats?.totalSwipeTime ?? '-';
        const totalSwipes = stats?.totalSwipe ?? '-';
        const mappingProjects = stats?.totalMappingProjects ?? '-';

        const swipeArea =
            userGroupStatsData?.userGroup?.projectTypeStats?.reduce(
                (sum, stat) => sum + (stat.area ?? 0),
                0,
            );

        const organizationsSupported =
            userGroupStatsData?.userGroup?.userGroupOrganizationStats?.length ??
            '-';

        return [
            {
                title: t('Tasks Completed'),
                value: totalSwipes,
                cached: false,
            },
            {
                title: t('Swipe Quality Score'),
                value: '-',
                cached: true,
            },
            {
                title: t('Total time spent swipping (min)'),
                value: totalSwipeTime,
                cached: true,
            },
            {
                title: t('Cumulative area swiped (sq.km)'),
                value: swipeArea?.toFixed(5) ?? '-',
                cached: true,
            },
            {
                title: t('Mapping Projects'),
                value: mappingProjects,
                cached: false,
            },
            {
                title: t('Organization supported'),
                value: organizationsSupported,
                cached: true,
            },
        ];
    }, [userGroupStatsData]);

    const calendarHeatmapData = React.useMemo(() => {
        const contributionStats =
            userGroupStatsData?.userGroup?.contributionStats;

        if (!contributionStats) {
            return {};
        }

        const MAX_SWIPE_PER_DAY = 600;

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
            {userGroupDetailPending && (
                <View style={styles.loading}>
                    <Text>Loading group details</Text>
                </View>
            )}
            {!userGroupDetailPending && !userGroupDetail && (
                <View style={styles.noUserId}>
                    <Text>
                        Details not available for the specified UserGroup
                    </Text>
                </View>
            )}
            {!userGroupDetailPending && userGroupDetail && (
                <>
                    <View style={styles.header}>
                        <Text style={styles.userGroupNameLabel}>
                            {userGroupDetail?.name}
                        </Text>
                        {userGroupDetail?.description && (
                            <Text style={styles.membersLabel}>
                                {userGroupDetail?.description}
                            </Text>
                        )}
                    </View>
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
                        <View style={styles.cachedInfo}>
                            <SvgXml
                                style={styles.databaseIcon}
                                xml={databaseIcon}
                                height={FONT_SIZE_SMALL}
                            />
                            <Text style={styles.infoText}>
                                {t('Cached Stats')}
                            </Text>
                        </View>
                        {!isUserMember && !isGroupArchived && (
                            <View style={styles.joinNewGroup}>
                                <Button
                                    color={COLOR_SUCCESS_GREEN}
                                    onPress={() => {
                                        Alert.alert(
                                            t('Join User Group'),
                                            t(
                                                'Are you sure you want to join this group?',
                                            ),
                                            [
                                                {
                                                    text: t('Cancel'),
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: t('OK'),
                                                    onPress:
                                                        handleJoinUserGroup,
                                                },
                                            ],
                                        );
                                    }}
                                    title={t('joinGroup')}
                                    accessibilityLabel={t('joinGroup')}
                                />
                            </View>
                        )}
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
                            <Text style={styles.headingText}>
                                {t('Contribution Heatmap')}
                            </Text>
                            <CalendarHeatmap data={calendarHeatmapData} />
                        </View>
                        <View style={styles.membersContainer}>
                            <Text style={styles.headingText}>
                                {t('Members')}
                            </Text>
                            {usersPending && (
                                <View style={styles.loading}>
                                    <Text>Fetching Members...</Text>
                                </View>
                            )}
                            {!usersPending &&
                                users?.map(user => (
                                    <View
                                        key={user.username}
                                        style={styles.leaderBoardItem}
                                    >
                                        <Text style={styles.userTitle}>
                                            {user.username}
                                        </Text>
                                    </View>
                                ))}
                            {!usersPending && (!users || users?.length === 0) && (
                                <View>
                                    <Text>
                                        {t('This groups has no member')}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {isUserMember && (
                            <View style={styles.settingsContainer}>
                                <Text style={styles.headingText}>
                                    {t('settings')}
                                </Text>
                                <ClickableListItem
                                    textStyle={styles.leaveButtonText}
                                    onPress={() => {
                                        Alert.alert(
                                            t('Leave User Group'),
                                            t(
                                                'Are you sure you want to leave this group?\n\nAfter you leave the group, you will still remain on the leaderboard. Contributions you made while a member of the group will still be counted towards the group.  Contributions after you leave will no longer be counted towards the group.',
                                            ),
                                            [
                                                {
                                                    text: t('Cancel'),
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: t('OK'),
                                                    onPress:
                                                        handleLeaveUserGroup,
                                                },
                                            ],
                                        );
                                    }}
                                    title={t('leaveGroup')}
                                    accessibilityLabel={t('leaveGroup')}
                                    hideIcon
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
