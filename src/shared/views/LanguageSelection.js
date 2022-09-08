// @flow
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { View, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { withTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';

import {
    COLOR_LIGHT_GRAY,
    COLOR_WHITE,
    supportedLanguages,
    SPACING_MEDIUM,
} from '../constants';
import PageHeader from '../common/PageHeader';
import type { TranslationFunction } from '../flow-types';
import { selectLanguage } from '../actions';

const checkMark = `<svg width="33" height="26" viewBox="0 0 33 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.9 13.1344L3 10.9004L11.5001 20.036L30.1342 0.766603L32.2342 3.00065L11.5001 24.5004L0.9 13.1344Z" fill="#262626" stroke="#262626" stroke-width="0.942857"/>
</svg>
`;

const styles = StyleSheet.create({
    languageSelectionScreen: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
    languageItemContainer: {
        padding: SPACING_MEDIUM,
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    selectedItem: {
        backgroundColor: COLOR_LIGHT_GRAY,
    },
});

const mapStateToProps = state => ({
    languageCode: state.ui.user.languageCode,
});

const mapDispatchToProps = dispatch => ({
    onSelectLanguage: (languageCode: string) => {
        dispatch(selectLanguage(languageCode));
    },
});

const enhance = compose(
    withTranslation('languageSelection'),
    firebaseConnect(),
    connect(mapStateToProps, mapDispatchToProps),
);

type OwnProps = {
    i18n: any,
    languageCode: string,
    navigation: Object,
    onSelectLanguage: string => void,
};

type ReduxProps = {
    languageCode: string,
    onSelectLanguage: string => void,
};

type InjectedProps = {
    t: TranslationFunction,
};

type Props = OwnProps & ReduxProps & InjectedProps;

function LanguageSelection(props: Props) {
    const { i18n, languageCode, navigation, onSelectLanguage, t } = props;

    const handleLanguageSelection = (code: string) => {
        onSelectLanguage(code);
        i18n.changeLanguage(code);
        navigation.navigate('WelcomeScreen');
    };

    return (
        <View style={styles.languageSelectionScreen}>
            <PageHeader heading={t('languageSelection')} />
            <ScrollView>
                {supportedLanguages.map(language => (
                    <Pressable
                        onPress={() => handleLanguageSelection(language.code)}
                        key={language.code}
                        style={[
                            styles.languageItemContainer,
                            languageCode === language.code
                                ? styles.selectedItem
                                : undefined,
                        ]}
                    >
                        <View
                            style={styles.languageItem}
                            accessible
                            accessibilityLabel={language.name}
                            accessibilityRole="button"
                        >
                            <Text>{language.name}</Text>
                            {languageCode === language.code && (
                                <SvgXml height="100%" xml={checkMark} />
                            )}
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

export default (enhance(LanguageSelection): any);
