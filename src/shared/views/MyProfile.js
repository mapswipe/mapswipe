// @flow
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import analytics from '@react-native-firebase/analytics';
import {
    View,
    StyleSheet,
    Image,
    Text,
    Button,
    Pressable,
    ScrollView,
    Linking,
} from 'react-native';
import { MessageBarManager } from 'react-native-message-bar';
import { withTranslation } from 'react-i18next';
import ProgressBar from 'react-native-progress/Bar';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { SvgXml } from 'react-native-svg';

import type { Node } from 'react';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import {
    COLOR_WHITE,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_SUCCESS_GREEN,
    COLOR_DARK_GRAY,
    COLOR_RED,
    supportedLanguages,
} from '../constants';
import Levels from '../Levels';
import InfoCard from '../common/InfoCard';
import CalendarHeatmap from '../common/CalendarHeatmap';

const GLOBAL = require('../Globals');

const chevronRight = `
<svg width="17" height="26" viewBox="0 0 17 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.23404 1L1 3.1L11.5356 13L1 22.9L3.23404 25L16 13L3.23404 1Z" fill="#262626" stroke="#262626" stroke-width="0.942857"/>
</svg>
`;

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
    heatmapContainer: {
        flexGrow: 1,
        padding: '4%',
    },
    heatMapHeading: {
        color: COLOR_DARK_GRAY,
        fontWeight: '600',
        fontSize: 16,
    },
    heatMap: {
        display: 'flex',
        flexDirection: 'row',
        height: 90,
    },
    settingsContainer: {
        flexGrow: 1,
        padding: '4%',
    },
    button: {
        borderBottomWidth: 1,
        borderColor: COLOR_LIGHT_GRAY,
    },
    deleteButton: {
        borderBottomWidth: 1,
        borderColor: COLOR_LIGHT_GRAY,
    },
    customButtonContainer: {
        backgroundColor: COLOR_WHITE,
        padding: '3%',
    },
    customButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dangerButtonText: {
        color: COLOR_RED,
    },
    infoContainer: {
        flexGrow: 1,
        padding: '4%',
    },
});

type OwnProps = {
    navigation: NavigationProp,
};

type ReduxProps = {
    level: number,
    kmTillNextLevel: number,
    languageCode: string,
};

type InjectedProps = {
    t: TranslationFunction,
    firebase: Object,
};

const mapStateToProps = (state): ReduxProps => ({
    level: state.ui.user.level,
    kmTillNextLevel: state.ui.user.kmTillNextLevel,
    languageCode: state.ui.user.languageCode,
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
        <Pressable
            onPress={() => handleUserGroupClick(item)}
            style={styles.userGroupItem}
        >
            <Text style={styles.userGroupItemTitle}>{title}</Text>
        </Pressable>
    );
};

type CustomButtonProps = {
    title: string,
    onPress: () => void,
    accessibilityLabel: string,
    style: ViewStyleProp,
    type?: 'primary' | 'danger',
    icon?: Node,
    hideIcon?: boolean,
};
/* eslint-disable global-require */
function CustomButton(props: CustomButtonProps) {
    const {
        title,
        onPress,
        accessibilityLabel,
        style,
        type,
        icon,
        hideIcon = false,
    } = props;
    const textStyle = type === 'danger' ? styles.dangerButtonText : undefined;
    return (
        <Pressable
            onPress={onPress}
            style={[styles.customButtonContainer, style]}
        >
            <View
                style={styles.customButton}
                accessible
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
            >
                <Text style={textStyle}>{title}</Text>
                {!hideIcon && icon && icon}
                {!hideIcon && !icon && (
                    <SvgXml height="100%" xml={chevronRight} />
                )}
            </View>
        </Pressable>
    );
}

type Props = OwnProps & ReduxProps & InjectedProps;

function MyProfile(props: Props) {
    const { navigation, level, t, kmTillNextLevel, firebase, languageCode } =
        props;

    const levelObject = Levels[level];
    const kmTillNextLevelToShow = kmTillNextLevel || 0;
    const swipes = Math.ceil(kmTillNextLevelToShow / 6);
    const sqkm = kmTillNextLevelToShow.toFixed(0);
    const levelProgressText = t('x tasks (s swipes) until the next level', {
        sqkm,
        swipes,
    });

    const selectedLanguage = supportedLanguages.find(
        language => language.code === languageCode,
    );

    const handleNewUserGroupJoinClick = () => {
        navigation.navigate('SearchUserGroup');
    };

    const handleUserGroupClick = (userGroup: UserGroup) => {
        navigation.navigate('UserGroup', {
            userGroup,
        });
    };

    const handleUserNameChangeClick = () => {
        navigation.navigate('ChangeUserName');
    };

    const handlePasswordChangeClick = () => {
        navigation.navigate('ChangePassword');
    };

    const handleNotificationsClick = () => {};

    const handleLanguageClick = () => {
        navigation.navigate('LanguageSelection');
    };

    const handleLogOutClick = () => {
        analytics().logEvent('sign_out');
        firebase.logout().then(() => {
            navigation.navigate('LoginNavigator');
        });
    };

    const handleDeleteAccountClick = () => {
        analytics().logEvent('delete_account');
        const user = firebase.auth().currentUser;
        firebase.database().ref().child(`v2/users/${user.uid}`).off('value');
        user.then(() => {
            MessageBarManager.showAlert({
                title: t('accountDeleted'),
                message: t('accountDeletedSuccessMessage'),
                alertType: 'info',
            });
            navigation.navigate('LoginNavigator');
        }).catch(() => {
            MessageBarManager.showAlert({
                title: t('accountDeletionFailed'),
                message: t('accountDeletionFailedMessage'),
                alertType: 'error',
            });
            navigation.navigate('LoginNavigator');
        });
    };

    const handleMapSwipeWebsiteClick = () => {
        navigation.push('WebviewWindow', {
            uri: 'https://mapswipe.org/',
        });
    };

    const handleMissingMapsClick = () => {
        navigation.push('WebviewWindow', {
            uri: 'https://www.missingmaps.org',
        });
    };

    const handleEmailClick = () => {
        Linking.openURL('mailto:info@mapswipe.org');
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
                        {firebase.auth().currentUser.displayName}
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
                            onPress={handleNewUserGroupJoinClick}
                            title={t('joinNewGroup')}
                            accessibilityLabel={t('joinNewGroup')}
                        />
                    </View>
                </View>
                <View style={styles.heatmapContainer}>
                    <Text numberOfLines={1} style={styles.heatMapHeading}>
                        {t('contributionHeatmap')}
                    </Text>
                    <CalendarHeatmap style={styles.heatMap} />
                </View>
                <View style={styles.settingsContainer}>
                    <Text numberOfLines={1} style={styles.userGroupHeadingText}>
                        {t('settings')}
                    </Text>
                    <CustomButton
                        style={styles.button}
                        onPress={handleUserNameChangeClick}
                        title={t('changeUserName')}
                        accessibilityLabel={t('changeUserName')}
                    />
                    <CustomButton
                        style={styles.button}
                        onPress={handlePasswordChangeClick}
                        title={t('changePassword')}
                        accessibilityLabel={t('changePassword')}
                    />
                    <CustomButton
                        style={styles.button}
                        onPress={handleNotificationsClick}
                        title={t('notifications')}
                        accessibilityLabel={t('notifications')}
                    />
                    <CustomButton
                        style={styles.button}
                        onPress={handleLanguageClick}
                        title={t('language')}
                        accessibilityLabel={t('language')}
                        icon={<Text>{selectedLanguage?.name}</Text>}
                    />
                    <CustomButton
                        style={styles.button}
                        onPress={handleLogOutClick}
                        title={t('logOut')}
                        accessibilityLabel={t('logOut')}
                        hideIcon
                    />
                    <CustomButton
                        style={styles.deleteButton}
                        onPress={handleDeleteAccountClick}
                        title={t('deleteAccount')}
                        accessibilityLabel={t('deleteAccount')}
                        type="danger"
                        hideIcon
                    />
                </View>
                <View style={styles.infoContainer}>
                    <CustomButton
                        style={styles.button}
                        onPress={handleMapSwipeWebsiteClick}
                        title={t('mapSwipeWebsite')}
                        accessibilityLabel={t('mapSwipeWebsite')}
                    />
                    <CustomButton
                        style={styles.button}
                        onPress={handleMissingMapsClick}
                        title={t('missingMaps')}
                        accessibilityLabel={t('missingMaps')}
                    />
                    <CustomButton
                        style={styles.button}
                        onPress={handleEmailClick}
                        title={t('email')}
                        accessibilityLabel={t('email')}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

export default (enhance(MyProfile): any);
