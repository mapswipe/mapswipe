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
        padding: '5%',
        flexShrink: 0,
    },
    searchUserGroupHeading: {
        fontWeight: '800',
        color: COLOR_WHITE,
        fontSize: 18,
    },
    content: {
        display: 'flex',
        flex: 1,
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: '2%',
    },
    userGroupSearchInput: {
        backgroundColor: COLOR_WHITE,
        marginBottom: '5%',
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
        padding: '3%',
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

type UserGroup = {
    key: string,
    name: string,
    nameKey: string,
    description: string,
    users: {
        [string]: string,
    },
};

type State = {
    searchText: string,
    userGroups: UserGroup[],
    loadingUserGroups: boolean,
};

type Props = OwnProps & InjectedProps;

class SearchUserGroup extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            loadingUserGroups: false,
            searchText: '',
            userGroups: [],
        };
    }

    handleSearchTextChange = (searchText: string) => {
        this.setState({ searchText, loadingUserGroups: false });
        const { firebase } = this.props;
        firebase
            .database()
            .ref('/v2/userGroups/')
            .orderByChild('nameKey')
            .equalTo(searchText.trim())
            .once('value', snapshot => {
                if (snapshot.exists()) {
                    const userGroups: UserGroup[] = [];
                    console.log(snapshot);
                    snapshot.forEach(item => {
                        userGroups.push({
                            key: item.key,
                            name: item.val().name,
                            nameKey: item.val().nameKey,
                            description: item.val().description,
                            users: item.val().users,
                        });
                    });
                    this.setState({ userGroups });
                } else {
                    this.setState({ userGroups: [] });
                }
                this.setState({ loadingUserGroups: false });
            });
    };

    handleUserGroupClick = (userGroup: UserGroup) => {
        const { navigation } = this.props;
        navigation.navigate('UserGroup', {
            userGroup,
        });
    };

    render() {
        const { t } = this.props;
        const { searchText, userGroups, loadingUserGroups } = this.state;

        return (
            <View style={styles.searchUserGroupContainer}>
                <View style={styles.header}>
                    <Text
                        numberOfLines={1}
                        style={styles.searchUserGroupHeading}
                    >
                        {t('joinGroup')}
                    </Text>
                </View>
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={loadingUserGroups}
                            onRefresh={() =>
                                this.handleSearchTextChange(searchText)
                            }
                        />
                    }
                >
                    <TextInput
                        style={styles.userGroupSearchInput}
                        placeholder={t('searchUserGroup')}
                        onChangeText={this.handleSearchTextChange}
                        value={searchText}
                    />
                    <View style={styles.userGroupList}>
                        {userGroups.map(userGroup => (
                            <Pressable
                                key={userGroup.nameKey}
                                onPress={() =>
                                    this.handleUserGroupClick(userGroup)
                                }
                            >
                                <Text
                                    style={styles.userGroupItem}
                                    numberOfLines={1}
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
}

export default (enhance(SearchUserGroup): any);
