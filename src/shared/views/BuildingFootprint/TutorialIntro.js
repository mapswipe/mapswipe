// @flow
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
        width: GLOBAL.SCREEN_WIDTH,
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
    tutText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '400',
        marginLeft: 10,
        marginBottom: 10,
        marginTop: 15,
        maxWidth: '85%',
        width: '95%',
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
                        {t('swipeToGetStarted')}
                    </Text>
                    <SwipeIconWhite />
                </View>
            </ScrollView>
        </View>
    );
};

export default (withTranslation('BuildingFootprintTutorialIntroScreen')(
    TutorialIntroScreen,
): any);
