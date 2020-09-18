// @flow
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Trans, withTranslation } from 'react-i18next';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
import type { TranslationFunction } from '../../flow-types';
import {
    NumberedTapIconWhite1,
    NumberedTapIconWhite2,
    NumberedTapIconWhite3,
    SwipeIconWhite,
    TapIconWhite,
} from '../../common/Tutorial/icons';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    background: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        flexDirection: 'row',
        width: GLOBAL.SCREEN_WIDTH * 2,
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
        marginTop: 20,
    },
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
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
        marginLeft: 10,
        marginTop: 10,
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
    exampleImage1: string,
    exampleImage2: string,
    lookFor: string,
    t: TranslationFunction,
};

/* eslint-disable global-require */
const TutorialIntroScreen = (props: Props) => {
    const { exampleImage1, exampleImage2, lookFor, t } = props;
    return (
        <View style={styles.background}>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>
                        {t('thisTutoWillTeachYou')}
                    </Text>
                    <View style={styles.tutRow}>
                        <SwipeIconWhite />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="TutorialIntroScreen:noChanges">
                                If there is nothing relevant in the images,
                                simply
                                <Text style={{ fontWeight: 'bold' }}>
                                    swipe
                                </Text>
                                to the next screen
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIconWhite1 />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="TutorialIntroScreen:seeChanges">
                                If you see...
                                <Text style={{ fontWeight: 'bold' }}>t</Text>
                                and the tile turns green
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIconWhite2 />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="TutorialIntroScreen:unsure">
                                Not sure about what you are seeing?
                                <Text style={{ fontWeight: 'bold' }}>
                                    Tap twice
                                </Text>
                                and the tile will turn yellow
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIconWhite3 />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="TutorialIntroScreen:badImagery">
                                Imagery issue, like if either image has clouds
                                covering the view?
                                <Text style={{ fontWeight: 'bold' }}>
                                    Tap three times
                                </Text>
                                and the tile will turn red
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <TapIconWhite />
                        <Text style={styles.tutText}>
                            {t('TutorialIntroScreen:tapAgain')}
                        </Text>
                    </View>

                    <Text style={styles.centeredHeader}>
                        {t('SwipeToContinue')}
                    </Text>
                    <Text style={styles.header}>&nbsp;</Text>
                </ScrollView>
            </View>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>{t('WhatToLookFor')}</Text>
                    <Text style={styles.tutText}>
                        {t('YouAreLookingFor', { lookFor })}
                    </Text>
                    <Text style={styles.tutText}>{t('FromTheGround')}</Text>
                    <Image
                        style={styles.introImage}
                        source={{
                            uri: exampleImage1,
                        }}
                    />

                    <Text style={styles.tutText}>{t('ImagesFromAbove')}</Text>
                    <Image
                        style={styles.introImage}
                        source={{
                            uri: exampleImage2,
                        }}
                    />
                    <Text style={styles.centeredHeader}>
                        {t('SwipeToContinue')}
                    </Text>
                </ScrollView>
            </View>
        </View>
    );
};

export default withTranslation('TutorialIntroScreen')(TutorialIntroScreen);
