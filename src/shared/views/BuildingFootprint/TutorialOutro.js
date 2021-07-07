// @flow
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
import type { TranslationFunction } from '../../flow-types';
import {
    MapswipeMagnifyingGlassIcon,
    TapIconWhite,
    SwipeRightIconWhite,
} from '../../common/Tutorial/icons';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    background: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
    },
    screenWidth: {
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
        marginTop: 40,
    },
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
        marginBottom: 20,
        marginTop: 20,
    },
    tutRow: {
        marginTop: 20,
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
    t: TranslationFunction,
};

/* eslint-disable global-require */
const TutorialOutroScreen = (props: Props) => {
    const { t } = props;
    return (
        <View style={styles.background}>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>
                        {t('dontWorryIfYoureUnsure')}
                    </Text>
                    <View style={styles.tutRow}>
                        <TapIconWhite />
                        <Text style={styles.tutText}>
                            {t('youCanAlwaysTapUnsure')}
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <MapswipeMagnifyingGlassIcon />
                        <Text style={styles.tutText}>
                            {t('everyImageViewedBy')}
                        </Text>
                    </View>

                    <Text style={styles.header}>
                        {t('wantToChangeYourAnswer')}
                    </Text>

                    <View style={styles.tutRow}>
                        <SwipeRightIconWhite />
                        <Text style={styles.tutText}>
                            {t('youCanSwipeBack')}
                        </Text>
                    </View>

                    <Text style={styles.centeredHeader}>
                        {t('TutorialIntroScreen:SwipeToContinue')}
                    </Text>
                </ScrollView>
            </View>
        </View>
    );
};

export default (withTranslation('BFTutorialOutroScreen')(
    TutorialOutroScreen,
): any);
