// @flow
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import {
    COLOR_DEEP_BLUE,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
} from '../../constants';
import type { TranslationFunction } from '../../flow-types';
import { NumberedTapIcon } from './icons';

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
                        <NumberedTapIcon bgColor={COLOR_YELLOW} number="2" />
                        <Text style={styles.tutText}>
                            Remember you can always tap twice to mark the tile
                            yellow if you&apos;re not sure what you see is waste
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_RED} number="3" />
                        <Text style={styles.tutText}>
                            Every image is viewed by at least 3 people, so
                            don&apos;t worry if you think you&apos;ve missed
                            something
                        </Text>
                    </View>

                    <Text style={styles.tutParagraph}>{t('holdZoom')}</Text>

                    <Text style={styles.header}>{t('SwipeToContinue')}</Text>
                    <Text style={styles.header}>&nbsp;</Text>
                </ScrollView>
            </View>
        </View>
    );
};

export default withTranslation('TutorialOutroScreen')(TutorialOutroScreen);
