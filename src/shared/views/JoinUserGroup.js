// @flow
import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, Text, TextInput } from 'react-native';
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

type OwnProps = {};

type InjectedProps = {
    t: TranslationFunction,
};

const enhance = compose(withTranslation('searchUserGroup'));

type State = {
    searchText: string | undefined,
};

type UserGroup = {
    id: string,
    title: string,
};

const userGroups: UserGroup[] = [
    {
        id: '1',
        title: 'User Group 1',
    },
    {
        id: '2',
        title: 'User Group 2',
    },
    {
        id: '3',
        title: 'User Group 3',
    },
    {
        id: '4',
        title: 'User Group 4',
    },
];

type Props = OwnProps & InjectedProps;

class JoinUserGroup extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = { searchText: undefined };
    }

    handleSearchTextChange = (searchText: string | undefined) => {
        this.setState({ searchText });
    };

    render() {
        const { t } = this.props;
        const { searchText } = this.state;

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
                <ScrollView contentContainerStyle={styles.content}>
                    <TextInput
                        style={styles.userGroupSearchInput}
                        placeholder={t('searchUserGroup')}
                        onChangeText={this.handleSearchTextChange}
                        value={searchText}
                    />
                    <View style={styles.userGroupList}>
                        {userGroups.map(userGroup => (
                            <Text
                                style={styles.userGroupItem}
                                numberOfLines={1}
                                key={userGroup.id}
                            >
                                {userGroup.title}
                            </Text>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default (enhance(JoinUserGroup): any);
