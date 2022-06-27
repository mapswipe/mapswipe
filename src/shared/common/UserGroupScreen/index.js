// @flow
import * as React from 'react';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { withTranslation } from 'react-i18next';
import {
    BackHandler,
    Image,
    StyleSheet,
    TouchableHighlight,
    Text,
    View,
    FlatList,
    Button,
} from 'react-native';
import type { NavigationProp, TranslationFunction } from '../../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_WHITE,
    COLOR_BLACK,
    COLOR_LIGHT_GRAY,
} from '../../constants';

import backArrowIcon from '../../views/assets/backarrow_icon.png';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    backButton: {
        width: 20,
        height: 20,
    },
    backButtonContainer: {
        width: 60,
        height: 60,
        padding: 20,
    },
    background: {
        backgroundColor: COLOR_WHITE,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
    },
    swipeNavTop: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 60,
        backgroundColor: COLOR_DEEP_BLUE,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    listView: {
        padding: 20,
    },
    item: {
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: 20,
        marginVertical: 2,
    },
    title: {
        color: COLOR_BLACK,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        color: COLOR_BLACK,
        marginBottom: 20,
    },
});

const enhance = compose(withTranslation('userGroupScreen'), firebaseConnect());

type Props = {
    navigation: NavigationProp,
    firebase: Object,
    t: TranslationFunction,
};

type State = {
    loadingUserGroups: boolean,
    userGroups: Array<Object>,
    loadingUserDetails: boolean,
    userGroupsOfCurrentUser: Object,
};

class UserGroupScreen extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            loadingUserGroups: false,
            userGroups: [],
            loadingUserDetails: false,
            userGroupsOfCurrentUser: {},
        };
    }

    componentDidMount() {
        const { navigation } = this.props;

        BackHandler.addEventListener('hardwareBackPress', () =>
            navigation.pop(),
        );

        this.loadUserGroups();
        this.loadUserDetails();
    }

    loadUserGroups = () => {
        const { firebase } = this.props;
        this.setState({ loadingUserGroups: true });

        firebase
            .database()
            .ref('/v2/userGroups/')
            .once('value', snapshot => {
                if (snapshot.exists()) {
                    const userGroups = [];
                    snapshot.forEach(item => {
                        userGroups.push({
                            key: item.key,
                            name: item.val().name,
                            description: item.val().description,
                        });
                    });
                    this.setState({ userGroups });
                } else {
                    this.setState({ userGroups: [] });
                }
                this.setState({ loadingUserGroups: false });
            });
    };

    loadUserDetails = () => {
        this.setState({ loadingUserDetails: true });

        const { firebase } = this.props;
        const userId = firebase.auth().currentUser.uid;
        const userGroupsOfUserRef = firebase
            .database()
            .ref(`/v2/users/${userId}/userGroups/`);
        userGroupsOfUserRef.once('value', snapshot => {
            if (snapshot.exists()) {
                const userGroups = snapshot.val();
                this.setState({ userGroupsOfCurrentUser: userGroups });
            } else {
                this.setState({ userGroupsOfCurrentUser: {} });
            }
            this.setState({ loadingUserDetails: false });
        });
    };

    render() {
        const { navigation, t } = this.props;
        const {
            userGroups,
            loadingUserGroups,
            loadingUserDetails,
            userGroupsOfCurrentUser,
        } = this.state;

        return (
            <View style={styles.background}>
                <View style={styles.swipeNavTop}>
                    <TouchableHighlight
                        style={styles.backButtonContainer}
                        onPress={() => navigation.pop()}
                    >
                        <Image
                            style={styles.backButton}
                            source={backArrowIcon}
                        />
                    </TouchableHighlight>
                    <Text style={styles.header}>User Groups</Text>
                </View>
                <FlatList
                    style={styles.listView}
                    data={userGroups}
                    extraData={userGroupsOfCurrentUser}
                    keyExtractor={d => d.key}
                    refreshing={loadingUserGroups || loadingUserDetails}
                    onRefresh={() => {
                        this.loadUserGroups();
                        this.loadUserDetails();
                    }}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.description}>
                                {item.description}
                            </Text>
                            {userGroupsOfCurrentUser[item.key] ? (
                                <Button
                                    title={t('leave')}
                                    onPress={() => {
                                        const { firebase } = this.props;
                                        const userId =
                                            firebase.auth().currentUser.uid;
                                        const updates = {};
                                        updates[
                                            `/v2/users/${userId}/userGroups/${item.key}`
                                        ] = null;
                                        updates[
                                            `/v2/userGroups/${item.key}/users/${userId}`
                                        ] = null;
                                        firebase
                                            .database()
                                            .ref()
                                            .update(updates, () => {
                                                this.loadUserDetails();
                                            });
                                    }}
                                />
                            ) : (
                                <Button
                                    title={t('join')}
                                    onPress={() => {
                                        const { firebase } = this.props;
                                        const userId =
                                            firebase.auth().currentUser.uid;
                                        const updates = {};
                                        updates[
                                            `/v2/users/${userId}/userGroups/${item.key}`
                                        ] = {
                                            joinedAt: new Date().getTime(),
                                        };
                                        updates[
                                            `/v2/userGroups/${item.key}/users/${userId}`
                                        ] = true;
                                        firebase
                                            .database()
                                            .ref()
                                            .update(updates, () => {
                                                this.loadUserDetails();
                                            });
                                    }}
                                />
                            )}
                        </View>
                    )}
                />
            </View>
        );
    }
}

export default (enhance(UserGroupScreen): any);
