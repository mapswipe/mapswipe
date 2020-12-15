// @flow
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
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
        fontSize: 18,
        marginTop: 20,
    },
    tutText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 10,
        marginTop: 15,
        maxWidth: '85%',
        width: '95%',
    },
    tutTextBold: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 10,
        marginTop: 15,
        maxWidth: '85%',
        width: '95%',
    },
    introImage: {
        borderColor: COLOR_WHITE,
        borderWidth: 1,
        height: 150,
        width: '100%',
        marginBottom: 15,
        marginTop: 15,
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
                <Text style={styles.header}>{t('letsLearnHowToMap')}</Text>
                <Text style={styles.tutText}>{t('youllSeeASquare')}</Text>
                <Text style={styles.tutTextBold}>
                    {t('squareContainsBuildings')}
                </Text>
                <Text style={styles.tutText}>{t('squareWillMove')}</Text>
                <Image
                    style={styles.introImage}
                    source={require('../assets/grid.jpg')}
                />

                <Text style={styles.centeredHeader}>
                    {t('swipeToGetStarted')}
                </Text>
            </ScrollView>
        </View>
    );
};

export default withTranslation('BuildingFootprintTutorialIntroScreen')(
    TutorialIntroScreen,
);
