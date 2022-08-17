// @flow
import React from 'react';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import { withTranslation } from 'react-i18next';
import {
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
    FONT_SIZE_SMALL,
    SPACING_SMALL,
} from '../constants';
import InfoCard from '../common/InfoCard';
import ClickableListItem from '../common/ClickableListItem';
import type { TranslationFunction } from '../flow-types';

const styles = StyleSheet.create({
    userGroup: {
        backgroundColor: COLOR_LIGHT_GRAY,
        flexGrow: 1,
    },

    noUserId: {
        alignItems: 'center',
        padding: SPACING_MEDIUM,
    },

    loading: {
        alignItems: 'center',
        padding: SPACING_MEDIUM,
    },

    header: {
        display: 'flex',
        backgroundColor: COLOR_DEEP_BLUE,
        justifyContent: 'center',
        padding: SPACING_MEDIUM,
        flexShrink: 0,
    },

    headingText: {
        color: COLOR_DARK_GRAY,
        fontWeight: FONT_WEIGHT_BOLD,
        paddingVertical: SPACING_SMALL,
    },
    userGroupNameLabel: {
        fontWeight: '800',
        color: COLOR_WHITE,
        fontSize: 18,
        paddingBottom: '2%',
    },
    membersLabel: {
        color: COLOR_LIGHT_GRAY,
        fontWeight: '600',
        fontSize: FONT_SIZE_SMALL,
    },
    content: {
        display: 'flex',
        backgroundColor: COLOR_LIGHT_GRAY,
    },
    userGroupsStatsContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING_MEDIUM / 2,
    },

    card: {
        width: '50%',
    },
    membersContainer: {
        padding: '4%',
    },
    leaderBoardItem: {
        backgroundColor: COLOR_WHITE,
        borderColor: COLOR_LIGHT_GRAY,
        borderBottomWidth: 1,
        padding: '3%',
        flexShrink: 0,
    },
    userTitle: {
        color: COLOR_DARK_GRAY,
        fontSize: FONT_SIZE_SMALL,
    },
    settingsContainer: {
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: '4%',
    },
    joinNewGroup: {
        marginHorizontal: '4%',
        marginVertical: '5%',
    },
    leaveButtonText: {
        color: COLOR_RED,
    },
});

type Stat = {
    title: string,
    value: string,
};

const userGroupStats: Stat[] = [
    {
        title: 'Swipes Completed',
        value: '100',
    },
    {
        title: 'Swipe Quality Score',
        value: '80%',
    },
    {
        title: 'Total time spent swipping (min)',
        value: '1893',
    },
    {
        title: 'Cumulative area swiped (sq.km)',
        value: '83912',
    },
    {
        title: 'Mapping Projects',
        value: '193',
    },
    {
        title: 'Organization supported',
        value: '12',
    },
];

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
        updates[`/v2/users/${userId}/userGroups/${userGroupId}`] = null;
        updates[`/v2/userGroups/${userGroupId}/users/${userId}`] = null;

        database()
            .ref()
            .update(updates, () => {
                console.info('Usergroup left');
            });
    }, [userId, userGroupId]);

    const handleJoinUserGroup = React.useCallback(() => {
        const updates = {};
        updates[`/v2/users/${userId}/userGroups/${userGroupId}`] = {
            joinedAt: new Date().getTime(),
        };
        updates[`/v2/userGroups/${userGroupId}/users/${userId}`] = true;

        database()
            .ref()
            .update(updates, () => {
                console.info('Usergroup joined');
            });
    }, [userId]);

    const isUserMember = !!userGroupDetail?.users?.[userId];

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
                        <Text
                            numberOfLines={1}
                            style={styles.userGroupNameLabel}
                        >
                            {userGroupDetail?.name}
                        </Text>
                        {userGroupDetail?.description && (
                            <Text style={styles.membersLabel}>
                                {userGroupDetail?.description}
                            </Text>
                        )}
                    </View>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        refreshControl={
                            <RefreshControl
                                refreshing={userGroupDetailPending}
                            />
                        }
                    >
                        {!isUserMember && (
                            <View style={styles.joinNewGroup}>
                                <Button
                                    color={COLOR_SUCCESS_GREEN}
                                    onPress={handleJoinUserGroup}
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
                                />
                            ))}
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
                                    <Text>This groups has no members</Text>
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
                                    onPress={handleLeaveUserGroup}
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
