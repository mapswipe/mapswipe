// @flow
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
import {
    GreenCheckIcon,
    GrayUnsureIcon,
    HideIcon,
    RedCrossIcon,
    SwipeIconWhite,
} from '../../common/Tutorial/icons';
import type { TranslationFunction } from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    background: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        flexDirection: 'row',
        width: GLOBAL.SCREEN_WIDTH * 2,
    },
    container: {
        paddingHorizontal: 20,
    },
    centeredHeader: {
        alignSelf: 'center',
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
        marginTop: 20,
    },
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 20,
        marginTop: 20,
    },
    introImage: {
        height: 150,
        width: '100%',
        marginBottom: 15,
        marginTop: 15,
    },
    screenWidth: {
        width: GLOBAL.SCREEN_WIDTH,
    },
    tutText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '400',
        marginLeft: 10,
        marginBottom: 10,
        marginTop: 15,
        maxWidth: '85%',
        width: '85%',
    },
    tutRow: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
});

type Props = {
    t: TranslationFunction,
};

/* eslint-disable global-require */
const TutorialIntroScreen = (props: Props) => {
    const { t } = props;
    return (
        <View style={styles.background}>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>{t('letsLearnHowToMap')}</Text>

                    <View style={styles.tutRow}>
                        <Text style={[styles.tutText, { marginLeft: 0 }]}>
                            {t('youllSeeASquare')}
                        </Text>
                    </View>

                    <View style={styles.tutRow}>
                        <Text
                            style={[
                                styles.tutText,
                                { fontWeight: '700', marginLeft: 0 },
                            ]}
                        >
                            {t('doesTheShapeOutlineABuilding')}
                        </Text>
                    </View>

                    <View style={styles.tutRow}>
                        <Text style={[styles.tutText, { marginLeft: 0 }]}>
                            {t('everyTimeYouSelectAnOption')}
                        </Text>
                    </View>

                    <Image
                        style={styles.introImage}
                        source={require('../assets/BFTutorialIntroImagery.png')}
                    />

                    <View
                        style={[
                            styles.tutRow,
                            { alignSelf: 'center', marginTop: 40 },
                        ]}
                    >
                        <Text style={styles.centeredHeader}>
                            {t('swipeToGetStarted')}
                        </Text>
                        <SwipeIconWhite />
                    </View>
                </ScrollView>
            </View>
            <View style={styles.screenWidth}>
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

                    <View
                        style={[
                            styles.tutRow,
                            { alignSelf: 'center', marginTop: 80 },
                        ]}
                    >
                        <Text style={styles.centeredHeader}>
                            {t('swipeToContinue')}
                        </Text>
                        <SwipeIconWhite />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default (withTranslation('BuildingFootprintTutorialIntroScreen')(
    TutorialIntroScreen,
): any);
