// @flow
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { InformationPage } from './mockData';
import { options, informationPages } from './mockData';

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
    introImage: {
        height: 150,
        width: '100%',
        marginBottom: 15,
        marginTop: 15,
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

type InformationPageProps = {
    t: TranslationFunction,
    information: InformationPage,
};
const InformationPageView = (props: InformationPageProps) => {
    const { information, t } = props;
    return (
        <View style={styles.screenWidth}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: SPACING_LARGE }}
            >
                <Text style={styles.header}>{information.title}</Text>
                {information?.blocks
                    ?.sort((a, b) => a.id - b.id)
                    .map(block => {
                        if (block.type === 'text') {
                            return (
                                <View style={styles.tutRow} key={block.id}>
                                    <Text
                                        style={[
                                            styles.tutText,
                                            { marginLeft: 0 },
                                        ]}
                                    >
                                        {block.description}
                                    </Text>
                                </View>
                            );
                        }
                        return (
                            <View style={styles.tutRow} key={block.id}>
                                <Image
                                    style={styles.introImage}
                                    src={block.image}
                                />
                            </View>
                        );
                    })}
                <View
                    style={[
                        styles.tutRow,
                        { alignSelf: 'center', marginTop: 40 },
                    ]}
                >
                    <Text style={styles.centeredHeader}>
                        {information.page === 1
                            ? t('swipeToGetStarted')
                            : t('swipeToContinue')}
                    </Text>
                    <SwipeIconWhite />
                </View>
            </ScrollView>
        </View>
    );
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
            {informationPages.map(information => (
                <InformationPageView
                    information={information}
                    key={information.page}
                    t={t}
                />
            ))}
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
