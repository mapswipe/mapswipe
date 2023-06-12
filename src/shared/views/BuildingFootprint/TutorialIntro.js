// @flow
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { withTranslation } from 'react-i18next';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_WHITE,
    SPACING_LARGE,
} from '../../constants';
import { HideIcon, SwipeIconWhite } from '../../common/Tutorial/icons';
import type { TranslationFunction } from '../../flow-types';
import { options, informationPages } from './mockData';
import InformationPage from '../../common/InformationPage';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    background: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        flexDirection: 'row',
    },
    container: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        gap: SPACING_LARGE,
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
    screenWidth: {
        width: GLOBAL.SCREEN_WIDTH,
    },
    textContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
    },
    textTitle: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 10,
        maxWidth: '85%',
        width: '85%',
    },
    textDescription: {
        color: COLOR_LIGHT_GRAY,
        fontSize: 15,
        fontWeight: '400',
        marginLeft: 10,
        maxWidth: '85%',
        width: '85%',
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
    svgIcon: {
        borderRadius: 25,
        height: 50,
        padding: 15,
        width: 50,
    },
});

type Props = {
    t: TranslationFunction,
};

/* eslint-disable global-require */
const TutorialIntroScreen = (props: Props) => {
    const { t } = props;
    const pagesCount = informationPages.length + 1;
    return (
        <View
            style={[
                styles.background,
                { width: GLOBAL.SCREEN_WIDTH * pagesCount },
            ]}
        >
            <View style={styles.screenWidth}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: SPACING_LARGE }}
                >
                    <Text style={[styles.tutText, { marginLeft: 0 }]}>
                        {t('useTheButtonsToAnswer')}
                    </Text>
                    <Text style={styles.header}>
                        {t('doesTheShapeOutlineABuilding')}
                    </Text>
                    {options.map(item => (
                        <View style={styles.tutRow} key={item.option}>
                            <View
                                style={[
                                    styles.svgIcon,
                                    { backgroundColor: item.iconColor },
                                ]}
                            >
                                <SvgXml
                                    xml={item.icon}
                                    width="100%"
                                    height="100%"
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.textTitle}>
                                    {item.title}
                                </Text>
                                <Text style={styles.textDescription}>
                                    {item.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                    <View style={[styles.tutRow, { marginLeft: 5 }]}>
                        <HideIcon />
                        <Text style={styles.tutText}>{t('hideIconText')}</Text>
                    </View>

                    <View
                        style={[
                            styles.tutRow,
                            {
                                alignSelf: 'center',
                                marginTop: options ? 0 : 40,
                            },
                        ]}
                    >
                        <Text style={styles.centeredHeader}>
                            {t('swipeToGetStarted')}
                        </Text>
                        <SwipeIconWhite />
                    </View>
                </ScrollView>
            </View>
            {informationPages.map(information => (
                <InformationPage
                    information={information}
                    key={information.page}
                    t={t}
                />
            ))}
        </View>
    );
};

export default (withTranslation('BuildingFootprintTutorialIntroScreen')(
    TutorialIntroScreen,
): any);
