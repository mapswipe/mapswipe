// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import {
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import { withTranslation } from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';
import Button from 'apsl-react-native-button';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_RED,
    COLOR_WHITE,
    supportedLanguages,
} from '../constants';
import { selectLanguage } from '../actions';
import type { NavigationProp, TranslationFunction } from '../flow-types';
import GLOBAL from '../Globals';

const styles = StyleSheet.create({
    arrow: {
        fontSize: 24,
        paddingLeft: 15,
    },
    globeIcon: {
        width: 30,
        height: 30,
    },
    langBoxButton: {
        borderRadius: 5,
        height: 60,
    },
    background: {
        alignItems: 'center',
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        flexDirection: 'column',
        width: GLOBAL.SCREEN_WIDTH,
    },
    langBox: {
        alignItems: 'center',
        backgroundColor: COLOR_WHITE,
        borderRadius: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 60,
        paddingLeft: 20,
        width: GLOBAL.SCREEN_WIDTH * 0.9,
    },
    langName: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_DARK_GRAY,
        fontWeight: '700',
        fontSize: 18,
        marginLeft: 10,
        minWidth: GLOBAL.SCREEN_WIDTH * 0.5,
    },
    logo: {
        flex: 1,
        height: GLOBAL.SCREEN_WIDTH * 0.06,
        resizeMode: 'contain',
        width: GLOBAL.SCREEN_WIDTH * 0.6,
    },
    continueButton: {
        alignSelf: 'center',
        backgroundColor: COLOR_RED,
        height: 60,
        marginTop: 30,
        marginBottom: 40,
        width: GLOBAL.SCREEN_WIDTH * 0.9,
    },
});

type Props = {
    i18n: Object,
    languageCode: string,
    navigation: NavigationProp,
    onSelectLanguage: (string) => void,
    t: TranslationFunction,
};

/* eslint-disable global-require */

/**
 * The screen shown as the app starts the very first time, just after the splashscreen
 * and before the welcome intro. Its only purpose is to pick a language for use in the app
 */
class _LanguageSelectionSplashScreen extends React.Component<Props> {
    componentDidMount() {
        const { languageCode, navigation } = this.props;
        if (languageCode !== 'xx') {
            navigation.navigate('WelcomeScreen');
        } else {
            SplashScreen.hide();
        }
    }

    onSetLanguage = (langCode: string) => {
        // called when the "continue" button is tapped
        const { i18n, navigation, onSelectLanguage } = this.props;
        onSelectLanguage(langCode);
        i18n.changeLanguage(langCode);
        navigation.navigate('WelcomeScreen');
    };

    onTapLanguage = () => {
        const { navigation } = this.props;
        navigation.push('LanguageSelectionScreen');
    };

    render() {
        const { languageCode, t } = this.props;

        // if the language code is unset, default to english for the first display
        const actualLangCode = languageCode === 'xx' ? 'en' : languageCode;
        const languageName = supportedLanguages.filter(
            (item) => item.code === actualLangCode,
        )[0].name;

        return (
            <View style={styles.background}>
                <Image
                    style={styles.logo}
                    source={require('../../../assets/splashscreen.png')}
                />
                <TouchableHighlight
                    onPress={this.onTapLanguage}
                    style={styles.langBoxButton}
                >
                    <View style={styles.langBox}>
                        <Image
                            style={styles.globeIcon}
                            source={require('../views/assets/globe_icon.png')}
                        />
                        <Text style={styles.langName}>{languageName}</Text>
                        <Text style={styles.arrow}>&gt;</Text>
                    </View>
                </TouchableHighlight>
                <Button
                    onPress={() => this.onSetLanguage(actualLangCode)}
                    style={styles.continueButton}
                >
                    {t('continue')}
                </Button>
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        languageCode: state.ui.user.languageCode,
        navigation: ownProps.navigation,
    };
};

const mapDispatchToProps = (dispatch) => ({
    onSelectLanguage: (languageCode: string) => {
        dispatch(selectLanguage(languageCode));
    },
});

export default withTranslation()(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(_LanguageSelectionSplashScreen),
);
