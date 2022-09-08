// @flow
import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { firebaseConnect } from 'react-redux-firebase';
import database from '@react-native-firebase/database';
import {
    Pressable,
    View,
    StyleSheet,
    ScrollView,
    Text,
    TextInput,
    RefreshControl,
} from 'react-native';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DARK_GRAY,
    SPACING_MEDIUM,
} from '../constants';
import PageHeader from '../common/PageHeader';
import type { TranslationFunction, UserGroupType } from '../flow-types';
import { rankedSearchOnList } from '../utils';

const styles = StyleSheet.create({
    searchUserGroupContainer: {
        backgroundColor: COLOR_DARK_GRAY,
        flex: 1,
    },
    content: {
        display: 'flex',
        flex: 1,
        backgroundColor: COLOR_LIGHT_GRAY,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: SPACING_MEDIUM / 2,
        backgroundColor: COLOR_WHITE,
        marginBottom: SPACING_MEDIUM / 2,
    },
    searchTextInput: {
        flexGrow: 1,
        color: COLOR_DARK_GRAY,
    },
    searchHint: {
        padding: SPACING_MEDIUM,
        alignItems: 'center',
    },
    noMatchingGroupMessage: {
        padding: SPACING_MEDIUM,
        alignItems: 'center',
    },
    hintText: {
        textAlign: 'center',
        opacity: 0.5,
    },
    userGroupList: {
        display: 'flex',
        flex: 1,
    },
    userGroupItem: {
        backgroundColor: COLOR_WHITE,
        borderColor: COLOR_LIGHT_GRAY,
        borderBottomWidth: 1,
        flexShrink: 0,
        padding: SPACING_MEDIUM,
    },
});

type UserGroupWithKey = UserGroupType & {
    key: string,
};

type OwnProps = {
    navigation: Object,
};

type InjectedProps = {
    t: TranslationFunction,
};

const enhance = compose(withTranslation('searchUserGroup'), firebaseConnect());

type Props = OwnProps & InjectedProps;

function SearchUserGroup(props: Props) {
    const { t, navigation } = props;
    const [loadingUserGroups, setLoadingUserGroups] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [userGroups, setUserGroups] = React.useState([]);
    (userGroups: UserGroupWithKey[]);
    const [matchingUserGroups, setMatchingUserGroups] = React.useState([]);

    const queryText = searchText.trim().toLowerCase();

    React.useEffect(() => {
        setLoadingUserGroups(true);

        const handleUserGroupsLoad = snapshot => {
            if (snapshot.exists()) {
                const newUserGroups = ((Object.entries(snapshot.val()).map(
                    ([key, group]) => ({
                        key,
                        ...group,
                    }),
                ): any): Array<UserGroupWithKey>);

                const nonArchivedUserGroups = ((newUserGroups.filter(
                    (ug: UserGroupWithKey) => !ug.archivedAt && !ug.archivedBy,
                ): any): UserGroupWithKey[]);

                setUserGroups(nonArchivedUserGroups);
            } else {
                setUserGroups([]);
            }

            setLoadingUserGroups(false);
        };

        const userGroupsRef = database().ref('/v2/userGroups/');

        userGroupsRef.on('value', handleUserGroupsLoad);

        return () => {
            userGroupsRef.off('value', handleUserGroupsLoad);
        };
    }, []);

    React.useEffect(() => {
        if (queryText.length < 3) {
            setMatchingUserGroups([]);
            return;
        }

        const filteredUserGroups = rankedSearchOnList(
            userGroups,
            queryText,
            userGroup => userGroup.name,
        );
        setMatchingUserGroups(filteredUserGroups);
    }, [userGroups, queryText]);

    const handleUserGroupClick = React.useCallback(
        (userGroupId: string) => {
            navigation.navigate('UserGroup', {
                userGroupId,
            });
        },
        [navigation],
    );

    return (
        <View style={styles.searchUserGroupContainer}>
            <PageHeader heading={t('Explore Groups')} />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={loadingUserGroups} />
                }
            >
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchTextInput}
                        placeholder={t('Enter search text')}
                        onChangeText={setSearchText}
                        value={searchText}
                        // FIXME: properly handle systemwide dark theme
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                    />
                </View>
                {queryText.length < 3 && (
                    <View style={styles.searchHint}>
                        <Text style={styles.hintText}>
                            {t(
                                'Start typing group name to begin the search! \n(at least 3 characters)',
                            )}
                        </Text>
                    </View>
                )}

                {queryText.length >= 3 && matchingUserGroups.length === 0 && (
                    <View style={styles.noMatchingGroupMessage}>
                        <Text style={styles.hintText}>
                            {t(
                                'There are no groups matching your search text!',
                            )}
                        </Text>
                    </View>
                )}
                <View style={styles.userGroupList}>
                    {matchingUserGroups.map(userGroup => (
                        <Pressable
                            key={userGroup.nameKey}
                            onPress={() => handleUserGroupClick(userGroup.key)}
                        >
                            <Text
                                style={styles.userGroupItem}
                                key={userGroup.nameKey}
                            >
                                {userGroup.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

export default (enhance(SearchUserGroup): any);
