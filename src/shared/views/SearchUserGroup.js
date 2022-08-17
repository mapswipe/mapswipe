// @flow
import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { firebaseConnect } from 'react-redux-firebase';
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
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
    SPACING_MEDIUM,
} from '../constants';
import type { TranslationFunction } from '../flow-types';

const styles = StyleSheet.create({
    searchUserGroupContainer: {
        backgroundColor: COLOR_DARK_GRAY,
        flex: 1,
    },
    header: {
        display: 'flex',
        backgroundColor: COLOR_DEEP_BLUE,
        justifyContent: 'center',
        padding: SPACING_MEDIUM,
        flexShrink: 0,
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
    searchButton: {
        flexShrink: 0,
        padding: SPACING_MEDIUM,
    },
    searchUserGroupHeading: {
        fontWeight: '800',
        color: COLOR_WHITE,
        fontSize: 18,
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

type OwnProps = {
    navigation: Object,
};

type InjectedProps = {
    t: TranslationFunction,
    firebase: Object,
};

const enhance = compose(withTranslation('searchUserGroup'), firebaseConnect());

type Props = OwnProps & InjectedProps;

function SearchUserGroup(props: Props) {
    const { t, firebase, navigation } = props;
    const [loadingUserGroups, setLoadingUserGroups] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [userGroups, setUserGroups] = React.useState([]);

    const fetchUserGroups = React.useCallback(() => {
        if (searchText.length < 3) {
            return;
        }

        const queryText = searchText.trim().toLowerCase();
        setLoadingUserGroups(true);
        console.info(queryText);

        firebase
            .database()
            .ref('/v2/userGroups/')
            .orderByChild('nameKey')
            .startAt(queryText)
            .limitToFirst(5)
            .once('value', snapshot => {
                if (snapshot.exists()) {
                    const newUserGroups = Object.entries(snapshot.val()).map(
                        ([key, group]) => ({
                            key,
                            ...group,
                        }),
                    );
                    setUserGroups(newUserGroups);
                } else {
                    setUserGroups([]);
                }

                setLoadingUserGroups(false);
            });
    }, [searchText, firebase]);

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
            <View style={styles.header}>
                <Text style={styles.searchUserGroupHeading}>
                    {t('joinGroup')}
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={loadingUserGroups}
                        onRefresh={fetchUserGroups}
                    />
                }
            >
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchTextInput}
                        placeholder={t('Enter at least 3 characters')}
                        onChangeText={setSearchText}
                        value={searchText}
                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                    />
                    <Pressable
                        style={({ pressed }) => ({
                            backgroundColor: pressed
                                ? COLOR_LIGHT_GRAY
                                : COLOR_WHITE,
                            opacity: searchText.length < 3 ? 0.3 : 1,
                        })}
                        onPress={fetchUserGroups}
                        disabled={searchText.length < 3}
                    >
                        <Text style={styles.searchButton}>Search</Text>
                    </Pressable>
                </View>
                <View style={styles.userGroupList}>
                    {userGroups.map(userGroup => (
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
