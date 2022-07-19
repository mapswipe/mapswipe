// @flow
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    View,
    StyleSheet,
    Image,
    Text,
    Button,
    Pressable,
    ScrollView,
} from 'react-native';
import { withTranslation } from 'react-i18next';
import ProgressBar from 'react-native-progress/Bar';

import type { NavigationProp, TranslationFunction } from '../flow-types';
import {
    COLOR_WHITE,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_SUCCESS_GREEN,
    COLOR_DARK_GRAY,
} from '../constants';
import Levels from '../Levels';
import InfoCard from '../common/InfoCard';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    myProfileScreen: {
        backgroundColor: COLOR_LIGHT_GRAY,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: COLOR_DEEP_BLUE,
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
        flexGrow: 1,
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
        backgroundColor: COLOR_LIGHT_GRAY,
        flexGrow: 1,
        padding: '4%',
    },
    userGroupHeadingText: {
        color: COLOR_DARK_GRAY,
        fontWeight: '600',
        fontSize: 16,
    },
    userGroups: {
        flex: 1,
    },
    userGroupItem: {
        backgroundColor: COLOR_WHITE,
        borderColor: COLOR_LIGHT_GRAY,
        borderBottomWidth: 1,
        padding: '3%',
        flexShrink: 0,
    },
    userGroupItemTitle: {
        color: COLOR_DARK_GRAY,
        fontSize: 14,
    },
    joinNewGroup: {
        marginVertical: '5%',
    },
});

type OwnProps = {
    navigation?: NavigationProp,
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
    { id: 'groupD', title: 'User Group D' },
    { id: 'groupE', title: 'User Group E' },
    { id: 'groupF', title: 'User Group F' },
];

type UserGroupItemProps = {
    item: UserGroup,
    handleUserGroupClick: (userGroup: UserGroup) => void,
};

const UserGroupItem = ({ item, handleUserGroupClick }: UserGroupItemProps) => {
    const { title } = item;

    return (
        <Pressable onPress={() => handleUserGroupClick(item)}>
            <View style={styles.userGroupItem}>
                <Text style={styles.userGroupItemTitle}>{title}</Text>
            </View>
        </Pressable>
    );
};

type Props = OwnProps & ReduxProps & InjectedProps;

function MyProfile(props: Props) {
    const { navigation, auth, level, t, kmTillNextLevel } = props;
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

    const handleJoinNewUserGroup = () => {
        navigation.navigate('JoinUserGroup');
    };

    const handleUserGroupClick = (userGroup: UserGroup) => {
        navigation.navigate('UserGroup', {
            userGroup,
        });
    };

    return (
        <View style={styles.myProfileScreen}>
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
                        color={COLOR_SUCCESS_GREEN}
                        height={10}
                        progress={0.1 ?? 0}
                        unfilledColor={COLOR_WHITE}
                        width={null}
                    />
                    <Text style={styles.progressText}>{levelProgressText}</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statsContainer}>
                    {userStats.map(stat => (
                        <InfoCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            style={styles.card}
                        />
                    ))}
                </View>
                <View style={styles.userGroupsContainer}>
                    <Text numberOfLines={1} style={styles.userGroupHeadingText}>
                        {t('userGroups')}
                    </Text>
                    <View style={styles.userGroups}>
                        {userGroups.map(userGroup => (
                            <UserGroupItem
                                key={userGroup.id}
                                item={userGroup}
                                handleUserGroupClick={handleUserGroupClick}
                            />
                        ))}
                    </View>
                    <View style={styles.joinNewGroup}>
                        <Button
                            color={COLOR_SUCCESS_GREEN}
                            onPress={handleJoinNewUserGroup}
                            title={t('joinNewGroup')}
                            accessibilityLabel={t('joinNewGroup')}
                        >
                            {t('joinNewGroup')}
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default (enhance(MyProfile): any);
