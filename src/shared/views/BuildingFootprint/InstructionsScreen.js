// @flow
import * as React from 'react';
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
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
import {
    GreenCheckIcon,
    GrayUnsureIcon,
    HideIcon,
    RedCrossIcon,
} from '../../common/Tutorial/icons';
import type { NavigationProp, TranslationFunction } from '../../flow-types';

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
    tutRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tutText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 5,
        marginTop: 10,
        maxWidth: '85%',
    },
});

type Props = {
    navigation: NavigationProp,
    t: TranslationFunction,
};

/* eslint-disable global-require */
class BFInstructionScreen extends React.Component<Props> {
    componentDidMount() {
        const { navigation } = this.props;
        BackHandler.addEventListener('hardwareBackPress', () =>
            navigation.pop(),
        );
    }

    render() {
        const { navigation, t } = this.props;
        return (
            <View style={styles.background}>
                <View style={styles.swipeNavTop}>
                    <TouchableHighlight
                        style={styles.backButtonContainer}
                        onPress={() => navigation.pop()}
                    >
                        <Image
                            style={styles.backButton}
                            source={require('../assets/backarrow_icon.png')}
                        />
                    </TouchableHighlight>
                    <Text
                        style={[
                            styles.header,
                            { alignSelf: 'center', marginTop: 15 },
                        ]}
                    >
                        {t('instructions')}
                    </Text>
                </View>

                <ScrollView style={styles.container}>
                    <Text style={[styles.tutText, { marginLeft: 0 }]}>
                        {t('useTheButtonsToAnswer')}
                    </Text>
                    <Text style={styles.header}>
                        {t('doesTheShapeOutlineABuilding')}
                    </Text>

                    <View style={styles.tutRow}>
                        <GreenCheckIcon />
                        <Text style={styles.tutText}>{t('tapGreenText')}</Text>
                    </View>

                    <View style={styles.tutRow}>
                        <RedCrossIcon />
                        <Text style={styles.tutText}>{t('tapRedText')}</Text>
                    </View>

                    <View style={styles.tutRow}>
                        <GrayUnsureIcon />
                        <Text style={styles.tutText}>{t('tapGrayText')}</Text>
                    </View>

                    <View style={[styles.tutRow, { marginLeft: 5 }]}>
                        <HideIcon />
                        <Text style={styles.tutText}>{t('hideIconText')}</Text>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

// $FlowFixMe
export default withTranslation('BuildingFootprintTutorialIntroScreen')(
    BFInstructionScreen,
);
