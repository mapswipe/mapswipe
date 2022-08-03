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
    changeUserNameScreen: {
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
    changeUserNameHeading: {
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
    confirmUserNameChange: {
        marginHorizontal: '4%',
        marginVertical: '5%',
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
            currentUserName: undefined,
            newUserName: undefined,
        };
    }

    handleCurrentUserNameChange = currentUserName => {
        this.setState(prevState => ({
            ...prevState,
            currentUserName,
        }));
    };

    handleNewUserNameChange = newUserName => {
        this.setState(prevState => ({
            ...prevState,
            newUserName,
        }));
    };

    handleUserNameChange = () => {};

    render() {
        const { t } = this.props;
        const { currentUserName, newUserName } = this.state;

        return (
            <View style={styles.changeUserNameScreen}>
                <View style={styles.header}>
                    <Text
                        numberOfLines={1}
                        style={styles.changeUserNameHeading}
                    >
                        {t('changeUserName')}
                    </Text>
                </View>
                <View style={styles.content}>
                    <Text numberOfLines={1} style={styles.label}>
                        {t('currentUserName')}
                    </Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={this.handleCurrentUserNameChange}
                        value={currentUserName}
                        maxLength={128}
                    />
                    <Text numberOfLines={1} style={styles.label}>
                        {t('newUserName')}
                    </Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={this.handleNewUserNameChange}
                        value={newUserName}
                        maxLength={128}
                    />
                    <View style={styles.confirmUserNameChange}>
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
