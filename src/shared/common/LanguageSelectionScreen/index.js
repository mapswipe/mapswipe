// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import {
    BackHandler,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import { withTranslation } from 'react-i18next';
import {
    COLOR_DEEP_BLUE,
    COLOR_WHITE,
    supportedLanguages,
} from '../../constants';
import LanguageItem from './LanguageItem';
import { selectLanguage } from '../../actions';
import type { NavigationProp } from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    backButton: {
        width: 20,
        height: 20,
    },
    backButtonContainer: {
        width: 60,
        height: 60,
        top: 0,
        padding: 20,
        left: 0,
        position: 'absolute',
    },
    background: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    container: {
        paddingHorizontal: 20,
    },
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
        marginTop: 20,
    },
    swipeNavTop: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 60,
        backgroundColor: COLOR_DEEP_BLUE,
    },
});

type Props = {
    i18n: any,
    languageCode: string,
    navigation: NavigationProp,
    onSelectLanguage: string => void,
};

/* eslint-disable global-require */

/**
 * The screen that shows the list of supported languages, and lets the user pick one
 * to set as the UI language throughout the app.
 * The selected language is set in the redux store
 */
class _LanguageSelectionScreen extends React.Component<Props> {
    componentDidMount() {
        const { navigation } = this.props;
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => navigation.pop(),
        );
    }

    componentWillUnmount() {
        if (this.backHandler) {
            this.backHandler.remove();
        }
    }

    onSelectLanguage = (langCode: string) => {
        const { i18n, navigation, onSelectLanguage } = this.props;
        onSelectLanguage(langCode);
        i18n.changeLanguage(langCode);
        navigation.pop();
    };

    render() {
        const { languageCode, navigation } = this.props;

        const items = [];
        supportedLanguages.forEach(langData => {
            items.push(
                <LanguageItem
                    key={langData.code}
                    langData={langData}
                    onSelectLanguage={this.onSelectLanguage}
                    selected={langData.code === languageCode}
                />,
            );
        });

        return (
            <View style={styles.background}>
                <View style={styles.swipeNavTop}>
                    <TouchableHighlight
                        style={styles.backButtonContainer}
                        onPress={() => navigation.pop()}
                    >
                        <Image
                            style={styles.backButton}
                            source={require('../../views/assets/backarrow_icon.png')}
                        />
                    </TouchableHighlight>
                    <Text
                        style={[
                            styles.header,
                            { alignSelf: 'center', marginTop: 15 },
                        ]}
                    >
                        Language
                    </Text>
                </View>

                <ScrollView style={styles.container}>{items}</ScrollView>
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

const mapDispatchToProps = dispatch => ({
    onSelectLanguage: (languageCode: string) => {
        dispatch(selectLanguage(languageCode));
    },
});

export default (withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(_LanguageSelectionScreen),
): any);
