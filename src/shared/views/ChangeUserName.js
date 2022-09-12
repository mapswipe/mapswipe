// @flow
import React from 'react';
import { firebaseConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { View, StyleSheet, Text, TextInput, Button } from 'react-native';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
    SPACING_MEDIUM,
    MIN_USERNAME_LENGTH,
} from '../constants';
import PageHeader from '../common/PageHeader';
import type { NavigationProp, TranslationFunction } from '../flow-types';

const styles = StyleSheet.create({
    changeUserNameScreen: {
        backgroundColor: COLOR_DARK_GRAY,
        flex: 1,
    },

    content: {
        flex: 1,
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: SPACING_MEDIUM,
    },

    input: {
        color: COLOR_DARK_GRAY,
        backgroundColor: COLOR_WHITE,
        marginVertical: SPACING_MEDIUM,
    },

    actions: {
        marginTop: 2 * SPACING_MEDIUM,
    },

    label: {
        color: COLOR_DARK_GRAY,
    },
});

const enhance = compose(withTranslation('changeUserName'), firebaseConnect());

type OwnProps = {
    navigation: NavigationProp,
};

type InjectedProps = {
    t: TranslationFunction,
    firebase: Object,
};

type Props = OwnProps & InjectedProps;

function ChangeUserName(props: Props) {
    const [newUserName, setNewUserName] = React.useState();

    const { t, navigation, firebase } = props;
    const userName = firebase.auth().currentUser?.displayName;
    const [updatePending, setUpdatePending] = React.useState(false);

    const handleConfirmButtonClick = React.useCallback(() => {
        if ((newUserName?.length ?? 0) >= MIN_USERNAME_LENGTH) {
            setUpdatePending(true);
            firebase
                .updateAuth({ displayName: newUserName })
                .then(() => firebase.updateProfile({ username: newUserName }))
                .then(
                    () => {
                        setUpdatePending(false);
                        navigation.goBack();
                    },
                    () => {
                        setUpdatePending(false);
                        console.error('failed to change update user profile');
                    },
                );
        }
    }, [firebase, newUserName]);

    return (
        <View style={styles.changeUserNameScreen}>
            <PageHeader heading={t('changeUserName')} />
            <View style={styles.content}>
                <Text numberOfLines={1} style={styles.label}>
                    {t('currentUserName')}
                </Text>
                <TextInput
                    style={styles.input}
                    value={userName}
                    editable={false}
                    maxLength={128}
                />
                <Text style={styles.label}>{t('newUserName')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setNewUserName}
                    value={newUserName}
                    maxLength={128}
                    editable={!updatePending}
                />
                <View style={styles.actions}>
                    <Button
                        color={COLOR_DEEP_BLUE}
                        onPress={handleConfirmButtonClick}
                        title={
                            updatePending
                                ? t('Updating Username')
                                : t('confirmUserNameChange')
                        }
                        disabled={
                            updatePending ||
                            (newUserName?.length ?? 0) < MIN_USERNAME_LENGTH
                        }
                    />
                </View>
            </View>
        </View>
    );
}

export default (enhance(ChangeUserName): any);
