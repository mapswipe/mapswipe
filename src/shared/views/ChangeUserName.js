// @flow
import React from 'react';
import auth from '@react-native-firebase/auth';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { View, StyleSheet, Text, TextInput, Button } from 'react-native';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
    SPACING_MEDIUM,
    FONT_SIZE_LARGE,
    FONT_WEIGHT_BOLD,
} from '../constants';
import type { TranslationFunction } from '../flow-types';

const styles = StyleSheet.create({
    changeUserNameScreen: {
        backgroundColor: COLOR_DARK_GRAY,
        flex: 1,
    },

    header: {
        display: 'flex',
        backgroundColor: COLOR_DEEP_BLUE,
        flexShrink: 0,
        padding: SPACING_MEDIUM,
    },

    changeUserNameHeading: {
        fontWeight: FONT_WEIGHT_BOLD,
        color: COLOR_WHITE,
        fontSize: FONT_SIZE_LARGE,
    },

    content: {
        flex: 1,
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: SPACING_MEDIUM,
    },

    input: {
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

const enhance = compose(withTranslation('changeUserName'));

type OwnProps = {};

type InjectedProps = {
    t: TranslationFunction,
};

type Props = OwnProps & InjectedProps;

type State = {
    currentUserName: ?string,
    newUserName: ?string,
};

class ChangeUserName extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            newUserName: undefined,
        };
    }

    handleNewUserNameChange = newUserName => {
        this.setState(prevState => ({
            ...prevState,
            newUserName,
        }));
    };

    handleUserNameChange = () => {};

    render() {
        const { t } = this.props;
        const { newUserName } = this.state;
        const userName = auth().currentUser.displayName;

        return (
            <View style={styles.changeUserNameScreen}>
                <View style={styles.header}>
                    <Text style={styles.changeUserNameHeading}>
                        {t('changeUserName')}
                    </Text>
                </View>
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
                        onChangeText={this.handleNewUserNameChange}
                        value={newUserName}
                        maxLength={128}
                    />
                    <View style={styles.actions}>
                        <Button
                            color={COLOR_DEEP_BLUE}
                            onPress={this.handleUserNameChange}
                            title={t('confirmUserNameChange')}
                            accessibilityLabel={t('confirmUserNameChange')}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

export default (enhance(ChangeUserName): any);
