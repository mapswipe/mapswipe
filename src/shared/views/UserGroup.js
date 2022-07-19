// @flow
import React from 'react';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { withTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, Text, Button } from 'react-native';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
} from '../constants';
import InfoCard from '../common/InfoCard';
import type { TranslationFunction } from '../flow-types';

type UserGroupItem = {
    id: string,
    title: string,
};

const styles = StyleSheet.create({
    userGroupContainer: {
        backgroundColor: COLOR_DARK_GRAY,
        flex: 1,
    },
    header: {
        display: 'flex',
        backgroundColor: COLOR_DEEP_BLUE,
        justifyContent: 'center',
        padding: '5%',
        flexShrink: 0,
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
        fontSize: 14,
    },
    content: {
        display: 'flex',
        flexGrow: 1,
        backgroundColor: COLOR_LIGHT_GRAY,
    },
    userGroupsStatsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: '2%',
    },
    card: {
        width: '46%',
        marginHorizontal: '2%',
        marginVertical: '2%',
        padding: '4%',
        borderRadius: 2,
    },
    leaderBoardsContainer: {
        flexGrow: 1,
        padding: '4%',
    },
    leaderBoardHeadingText: {
        color: COLOR_DARK_GRAY,
        fontWeight: '800',
        fontSize: 18,
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
        fontSize: 14,
    },
    settingsContainer: {
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: '4%',
    },
    settingsHeadingText: {
        color: COLOR_DARK_GRAY,
        fontWeight: '800',
        fontSize: 18,
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

type LeaderBoard = {
    id: string,
    title: string,
    noOfSwipes: number,
    level: number,
};

const leaderBoards: LeaderBoard[] = [
    {
        id: '1',
        title: 'Ram',
        noOfSwipes: 100,
        level: 20,
    },
    {
        id: '2',
        title: 'Hari',
        noOfSwipes: 80,
        level: 15,
    },
    {
        id: '3',
        title: 'Shyam',
        noOfSwipes: 70,
        level: 18,
    },
    {
        id: '4',
        title: 'Gyan',
        noOfSwipes: 60,
        level: 15,
    },
    {
        id: '5',
        title: 'Sita',
        noOfSwipes: 50,
        level: 12,
    },
];

const enhance = compose(withTranslation('userGroupScreen'), firebaseConnect());

type OwnProps = {
    navigation: {
        state: {
            params: { userGroup?: UserGroupItem },
        },
    },
};

type InjectedProps = {
    t: TranslationFunction,
};

type Props = OwnProps & InjectedProps;

function UserGroup(props: Props) {
    const { navigation, t } = props;

    const handleLeaveUserGroup = {};

    return (
        <View style={styles.userGroupContainer}>
            <View style={styles.header}>
                <Text numberOfLines={1} style={styles.userGroupNameLabel}>
                    {navigation?.state?.params?.userGroup?.title}
                </Text>
                <Text numberOfLines={1} style={styles.membersLabel}>
                    20 memebers
                </Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
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
                <View style={styles.leaderBoardsContainer}>
                    <Text
                        numberOfLines={1}
                        style={styles.leaderBoardHeadingText}
                    >
                        {t('leaderBoards')}
                    </Text>
                    {leaderBoards.map(user => (
                        <View key={user.title} style={styles.leaderBoardItem}>
                            <Text style={styles.userTitle}>{user.title}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.settingsContainer}>
                    <Text numberOfLines={1} style={styles.settingsHeadingText}>
                        {t('settings')}
                    </Text>
                    <Button
                        onPress={handleLeaveUserGroup}
                        title={t('leaveGroup')}
                        accessibilityLabel={t('leaveGroup')}
                    >
                        {t('leaveGroup')}
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}
export default (enhance(UserGroup): any);
