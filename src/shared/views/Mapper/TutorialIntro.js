// @flow
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Trans, withTranslation } from 'react-i18next';
import {
    COLOR_DEEP_BLUE,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
} from '../../constants';
import type { TranslationFunction } from '../../flow-types';
import { NumberedTapIcon } from '../../common/Tutorial/icons';

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
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
        marginTop: 20,
    },
    tutRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tutParagraph: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 10,
    },
    tutText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 5,
        marginTop: 10,
        maxWidth: '85%',
    },
    tutImage: {
        height: 50,
        resizeMode: 'contain',
        width: 50,
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
    t: TranslationFunction,
};

/* eslint-disable global-require */
const TutorialIntroScreen = (props: Props) => {
    const { exampleImage1, exampleImage2, t } = props;
    return (
        <View style={styles.background}>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>
                        {t('thisTutoWillTeachYou')}
                    </Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/swipeleft_icon_white.png')}
                            style={styles.tutImage}
                        />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:noChanges">
                                If there is no waste in the images, simply{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    swipe
                                </Text>{' '}
                                to the next screen
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_GREEN} number="1" />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:seeChanges">
                                If you see a change in buildings,{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    tap once
                                </Text>{' '}
                                and the tile turns green
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_YELLOW} number="2" />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:unsure">
                                Unsure?{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    Tap twice
                                </Text>{' '}
                                and the tile will turn yellow
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_RED} number="3" />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:badImagery">
                                Imagery issue, like if either image has clouds
                                covering the view?{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    Tap three times
                                </Text>{' '}
                                and the tile will turn red
                            </Trans>
                        </Text>
                    </View>

                    <Text style={styles.tutParagraph}>{t('holdZoom')}</Text>

                    <Text style={styles.header}>{t('SwipeToContinue')}</Text>
                    <Text style={styles.header}>&nbsp;</Text>
                </ScrollView>
            </View>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>What to look for</Text>
                    <Text style={styles.tutText}>
                        You are looking for piles of solid waste. From the
                        ground it looks like this:
                    </Text>
                    <Image
                        style={styles.introImage}
                        source={{
                            uri: exampleImage1,
                        }}
                    />

                    <Text style={styles.tutText}>
                        But the images you will see will show solid waste from
                        above, like this:
                    </Text>
                    <Image
                        style={styles.introImage}
                        source={{
                            uri: exampleImage2,
                        }}
                    />
                    <Text style={styles.header}>{t('SwipeToContinue')}</Text>
                </ScrollView>
            </View>
        </View>
    );
};

export default withTranslation('TutorialIntroScreen')(TutorialIntroScreen);
