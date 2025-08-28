// @flow
import React, { useState } from 'react';
import { firebaseConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import {
    COLOR_WHITE,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_DARK_GRAY,
    SPACING_MEDIUM,
    MIN_USERNAME_LENGTH,
    HEIGHT_INPUT,
    HEIGHT_BUTTON,
    FONT_SIZE_INPUT_LABEL,
} from '../constants';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import { showAlert } from '../common/ToastWrapper.ts';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import { checkUserNameExists, validateUserName } from '../utils';

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

        // width: GLOBAL.SCREEN_WIDTH * 0.9,
        height: HEIGHT_INPUT,
        borderRadius: 5,
        // color: COLOR_WHITE,
        paddingLeft: 10,
    },

    readOnlyInput: {
        opacity: 0.6,
    },

    actions: {
        marginTop: 2 * SPACING_MEDIUM,
    },

    label: {
        fontSize: FONT_SIZE_INPUT_LABEL,
        color: COLOR_DARK_GRAY,
    },

    button: {
        backgroundColor: COLOR_DEEP_BLUE,
        height: HEIGHT_BUTTON,
    },

    buttonText: {
        color: COLOR_WHITE,
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
    const [newUserName, setNewUserName] = useState();
    const [updatePending, setUpdatePending] = useState(false);

    const { t, navigation, firebase } = props;
    const userName = firebase.auth().currentUser?.displayName;

    const handleConfirmButtonClick = React.useCallback(async () => {
        const isValid = validateUserName(newUserName);

        if (!isValid) {
            showAlert({
                title: t('signup:errorOnSignup'),
                message: t('signup:usernameErrorMessage'),
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }

        const userNameAlreadyExist = await checkUserNameExists(newUserName);

        if (userNameAlreadyExist) {
            showAlert({
                title: t('signup:errorOnSignup'),
                message: t('signup:userNameExistError'),
                alertType: 'error',
                shouldHideAfterDelay: false,
            });
            return;
        }
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
    }, [firebase, newUserName]);

    return (
        <View style={styles.changeUserNameScreen}>
            <PageHeader heading={t('changeUserName')} />
            <View style={styles.content}>
                <Text numberOfLines={1} style={styles.label}>
                    {t('currentUserName')}
                </Text>
                <TextInput
                    style={[styles.input, styles.readOnlyInput]}
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
                        style={styles.button}
                        textStyle={styles.buttonText}
                        onPress={handleConfirmButtonClick}
                        isDisabled={
                            updatePending ||
                            (newUserName?.length ?? 0) < MIN_USERNAME_LENGTH
                        }
                    >
                        {updatePending
                            ? t('Updating Username')
                            : t('confirmUserNameChange')}
                    </Button>
                </View>
            </View>
        </View>
    );
}

export default (enhance(ChangeUserName): any);
