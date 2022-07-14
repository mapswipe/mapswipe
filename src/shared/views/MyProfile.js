// @flow
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { View, StyleSheet, Image, Text, FlatList, Button } from 'react-native';
import { withTranslation } from 'react-i18next';
import ProgressBar from 'react-native-progress/Bar';

import type { NavigationProp, TranslationFunction } from '../flow-types';
import {
    COLOR_WHITE,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_LIME_BACKGROUND,
    COLOR_DARK_GRAY,
} from '../constants';
import Levels from '../Levels';
import InfoCard from '../common/InfoCard';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    background: {
        backgroundColor: COLOR_WHITE,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 0.3,
        padding: '5%',
    },
    avatar: {
        flex: 2,
        height: 110,
        width: 110,
    },
    details: {
        flex: 4,
        justifyContent: 'center',
        paddingLeft: '5%',
    },
    name: {
        fontWeight: '800',
        color: COLOR_WHITE,
        fontSize: 18,
        paddingBottom: '6%',
    },
    level: {
        flexDirection: 'row',
        paddingBottom: '5%',
    },
    levelText: {
        color: COLOR_WHITE,
        fontWeight: '600',
        fontSize: 14,
        paddingRight: '2%',
    },
    progressText: {
        color: COLOR_WHITE,
        fontSize: 14,
    },
    content: {
        display: 'flex',
        justifyContent: 'flex-start',
        backgroundColor: COLOR_LIGHT_GRAY,
        flex: 1,
    },
    statsContainer: {
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
    userGroupsContainer: {
        backgroundColor: COLOR_WHITE,
        flexGrow: 1,
        padding: '2%',
    },
    userGroupText: {
        color: COLOR_DARK_GRAY,
        fontWeight: '800',
        fontSize: 18,
        paddingLeft: '2%',
    },
    listView: {
        flex: 1,
        padding: '2%',
    },
    userGroupItem: {
        borderColor: COLOR_LIGHT_GRAY,
        borderBottomWidth: 1,
        padding: '3%',
        flexShrink: 0,
    },
    userGroupItemText: {
        color: COLOR_DARK_GRAY,
        fontSize: 14,
    },
});

type OwnProps = {
    navigation?: NavigationProp,
    tabLabel?: string,
};

type ReduxProps = {
    auth: Object,
    level: number,
    kmTillNextLevel: number,
    profile: {
        taskContributionCount?: number,
    },
};

type InjectedProps = {
    t: TranslationFunction,
};

const mapStateToProps = (state): ReduxProps => ({
    auth: state.firebase.auth,
    level: state.ui.user.level,
    profile: state.firebase.profile,
    kmTillNextLevel: state.ui.user.kmTillNextLevel,
});

const enhance = compose(
    withTranslation('profileScreen'),
    firebaseConnect(),
    connect(mapStateToProps),
);

type Stat = {
    title: string,
    value: string,
};

type UserGroup = {
    id: string,
    title: string,
};

const userStats: Stat[] = [
    {
        title: 'Tasks Completed',
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

const userGroups: UserGroup[] = [
    { id: 'groupA', title: 'User Group A' },
    { id: 'groupB', title: 'User Group B' },
    { id: 'groupC', title: 'User Group C' },
    { id: 'groupD', title: 'User Group A' },
    { id: 'groupE', title: 'User Group B' },
    { id: 'groupF', title: 'User Group C' },
];

const UserGroupItem = ({ item }: { item: UserGroup }) => {
    const { title } = item;

    return (
        <View style={styles.userGroupItem}>
            <Text style={styles.userGroupItemText}>{title}</Text>
        </View>
    );
};

function userGroupKeySelector(userGroup: UserGroup) {
    return userGroup.id;
}

type State = {};
type Props = OwnProps & ReduxProps & InjectedProps;

class MyProfile extends React.Component<Props, State> {
    render() {
        const { auth, level, t, kmTillNextLevel } = this.props;
        const levelObject = Levels[level];
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

        const onJoinUserGroup = () => {};

        return (
            <View style={styles.background}>
                <View style={styles.header}>
                    <Image
                        style={styles.avatar}
                        key={levelObject.title}
                        source={levelObject.badge}
                        accessibilityLabel={levelObject.title}
                    />
                    <View style={styles.details}>
                        <Text numberOfLines={1} style={styles.name}>
                            {auth.displayName}
                        </Text>
                        <View style={styles.level}>
                            <Text style={styles.levelText}>
                                {t('Level X', { level })}
                            </Text>
                            <Text style={styles.levelText}>
                                ({levelObject.title})
                            </Text>
                        </View>
                        <ProgressBar
                            borderRadius={0}
                            borderWidth={0}
                            color={COLOR_LIME_BACKGROUND}
                            height={10}
                            progress={0.1 ?? 0}
                            unfilledColor={COLOR_WHITE}
                            width={null}
                        />
                        <Text style={styles.progressText}>
                            {levelProgressText}
                        </Text>
                    </View>
                </View>
                <View style={styles.content}>
                    <View style={styles.statsContainer}>
                        {userStats.map(stat => (
                            <InfoCard
                                title={stat.title}
                                value={stat.value}
                                style={styles.card}
                            />
                        ))}
                    </View>
                    <View style={styles.userGroupsContainer}>
                        <Text numberOfLines={1} style={styles.userGroupText}>
                            {t('user groups')}
                        </Text>
                        <FlatList
                            style={styles.listView}
                            data={userGroups}
                            keySelector={userGroupKeySelector}
                            renderItem={UserGroupItem}
                            ListFooterComponent={
                                <Button
                                    onPress={this.onJoinUserGroup}
                                    title={t('join new group')}
                                    accessibilityLabel={t('join new group')}
                                >
                                    {t('join new group')}
                                </Button>
                            }
                        />
                    </View>
                </View>
            </View>
        );
    }
}

export default (enhance(MyProfile): any);
