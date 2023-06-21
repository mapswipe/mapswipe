// @flow
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
import type { TranslationFunction, Option } from '../../flow-types';
import {
    MapswipeMagnifyingGlassIcon,
    SwipeIconWhite,
    SwipeRightIconWhite,
} from '../../common/Tutorial/icons';
import * as SvgIcons from '../../common/SvgIcons';

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
        marginBottom: 10,
        marginTop: 30,
    },
    tutRow: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    tutText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 10,
        marginTop: 10,
        maxWidth: '85%',
    },
});

type Props = {
    t: TranslationFunction,
    firstOption?: Option,
};

/* eslint-disable global-require */
const TutorialOutroScreen = (props: Props) => {
    const { t, firstOption } = props;
    return (
        <View style={styles.background}>
            <View style={styles.screenWidth}>
                <ScrollView style={styles.container}>
                    <Text style={styles.header}>
                        {t('dontWorryIfYoureUnsure')}
                    </Text>
                    <View style={styles.tutRow}>
                        <View
                            style={{
                                marginLeft: 5,
                                marginRight: 5,
                                marginTop: 10,
                            }}
                        >
                            <MapswipeMagnifyingGlassIcon />
                        </View>
                        <Text style={styles.tutText}>
                            {t('everyImageViewedBy')}
                        </Text>
                    </View>

                    <Text style={styles.header}>
                        {t('wantToChangeYourAnswer')}
                    </Text>

                    <View style={styles.tutRow}>
                        <View
                            style={{
                                marginLeft: 5,
                                marginRight: 5,
                                marginTop: 10,
                            }}
                        >
                            <SwipeRightIconWhite />
                        </View>
                        <Text style={styles.tutText}>
                            {t('youCanSwipeBack')}
                        </Text>
                    </View>

                    <View style={styles.tutRow}>
                        <View
                            style={{
                                borderColor: COLOR_WHITE,
                                borderRadius: 40 + 5,
                                borderWidth: 5,
                                height: 40 + 2 * 5,
                                width: 40 + 2 * 5,
                                backgroundColor:
                                    firstOption?.iconColor ?? '#bbcb7d',
                            }}
                        >
                            <SvgXml
                                xml={
                                    firstOption?.icon
                                        ? SvgIcons[firstOption.icon]
                                        : SvgIcons.checkmarkOutline
                                }
                                width="100%"
                                height="100%"
                            />
                        </View>
                        <Text style={styles.tutText}>
                            {t('yourPreviousAnswerIsMarked')}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.tutRow,
                            { alignSelf: 'center', marginTop: 40 },
                        ]}
                    >
                        <Text style={styles.centeredHeader}>
                            {t('TutorialIntroScreen:SwipeToContinue')}
                        </Text>
                        <SwipeIconWhite />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default (withTranslation('BFTutorialOutroScreen')(
    TutorialOutroScreen,
): any);
