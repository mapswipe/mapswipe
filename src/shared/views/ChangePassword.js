// @flow
import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { View, StyleSheet, Text, TextInput, Button } from 'react-native';
import {
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_DARK_GRAY,
} from '../constants';
import type { TranslationFunction } from '../flow-types';

const styles = StyleSheet.create({
    changePasswordScreen: {
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
    changePasswordHeading: {
        fontWeight: '800',
        color: COLOR_WHITE,
        fontSize: 18,
        paddingBottom: '2%',
    },
    content: {
        display: 'flex',
        flex: 1,
        backgroundColor: COLOR_LIGHT_GRAY,
        padding: '2%',
    },
    input: {
        backgroundColor: COLOR_WHITE,
        marginBottom: '5%',
        fontSize: 16,
    },
    label: {
        color: COLOR_DARK_GRAY,
        fontWeight: '600',
        fontSize: 16,
    },
    confirmPasswordChange: {
        marginHorizontal: '4%',
        marginVertical: '5%',
    },
});

const enhance = compose(withTranslation('changePassword'));

type OwnProps = {};

type InjectedProps = {
    t: TranslationFunction,
};

type Props = OwnProps & InjectedProps;

type State = {
    currentPassword: string | undefined,
    newPassword: string | undefined,
};

class ChangePassword extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            currentPassword: undefined,
            newPassword: undefined,
        };
    }

    handleCurrentPasswordChange = currentPassword => {
        this.setState(prevState => ({
            ...prevState,
            currentPassword,
        }));
    };

    handleNewPasswordChange = newPassword => {
        this.setState(prevState => ({
            ...prevState,
            newPassword,
        }));
    };

    handlePasswordChange = () => {};

    render() {
        const { t } = this.props;
        const { currentPassword, newPassword } = this.state;

        return (
            <View style={styles.changePasswordScreen}>
                <View style={styles.header}>
                    <Text
                        numberOfLines={1}
                        style={styles.changePasswordHeading}
                    >
                        {t('changePassword')}
                    </Text>
                </View>
                <View style={styles.content}>
                    <Text numberOfLines={1} style={styles.label}>
                        {t('currentPassword')}
                    </Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={this.handleCurrentPasswordChange}
                        value={currentPassword}
                        maxLength={128}
                    />
                    <Text numberOfLines={1} style={styles.label}>
                        {t('newPassword')}
                    </Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={this.handleNewPasswordChange}
                        value={newPassword}
                        maxLength={128}
                    />
                    <View style={styles.confirmPasswordChange}>
                        <Button
                            color={COLOR_DEEP_BLUE}
                            onPress={this.handlePasswordChange}
                            title={t('confirmPasswordChange')}
                            accessibilityLabel={t('confirmPasswordChange')}
                        >
                            {t('confirmPasswordChange')}
                        </Button>
                    </View>
                </View>
            </View>
        );
    }
}

export default (enhance(ChangePassword): any);
