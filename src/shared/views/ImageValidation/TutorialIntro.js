// @flow
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { withTranslation } from 'react-i18next';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_WHITE,
    SPACING_LARGE,
} from '../../constants';
import { SwipeIconWhite } from '../../common/Tutorial/icons';
import type {
    TranslationFunction,
    ProjectInformation,
    Option,
} from '../../flow-types';
import InformationPage from '../../common/InformationPage';
import * as SvgIcons from '../../common/SvgIcons';
import { toCamelCase } from '../../common/Tutorial';
import BFTutorialImage from '../assets/BFTutorialIntroImagery.png';

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
        padding: 10,
        width: 50,
    },
});

/* eslint-disable global-require */
const fallbackInformationPage: ProjectInformation = [
    {
        blocks: [
            {
                blockNumber: 1,
                blockType: 'text',
                textDescription:
                    "You'll see a shape on an image. Use the buttons to answer.",
            },
            {
                blockNumber: 2,
                blockType: 'text',
                textDescription: 'Does the shape outline a building?',
            },
            {
                blockNumber: 3,
                blockType: 'text',
                textDescription:
                    "Every time you select an option, you'll be shown a new shape and image.",
            },
            {
                blockNumber: 4,
                blockType: 'image',
                image: Image.resolveAssetSource(BFTutorialImage)?.uri,
            },
        ],
        pageNumber: 1,
        title: "Let's learn how to map with some examples.",
    },
];

type Props = {
    t: TranslationFunction,
    informationPages?: ProjectInformation,
    title: string,
    customOptions: Option[],
};

const TutorialIntroScreen = (props: Props) => {
    const {
        t,
        informationPages: informationPagesFromProps,
        customOptions,
        title,
    } = props;

    const informationPages =
        informationPagesFromProps ?? fallbackInformationPage;
    const pagesCount =
        informationPages && informationPages.length > 0
            ? informationPages.length + 1
            : 1;

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
                    <Text style={styles.header}>{title}</Text>
                    {customOptions?.map(item => (
                        <View style={styles.tutRow} key={item.value}>
                            <View
                                style={[
                                    styles.svgIcon,
                                    { backgroundColor: item.iconColor },
                                ]}
                            >
                                <SvgXml
                                    xml={
                                        SvgIcons[toCamelCase(item.icon)] ??
                                        SvgIcons.removeOutline
                                    }
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
                    <View
                        style={[
                            styles.tutRow,
                            {
                                alignSelf: 'center',
                                marginTop: 40,
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
            {informationPages
                ?.sort((a, b) => a.pageNumber - b.pageNumber)
                .map((information, index) => (
                    <InformationPage
                        information={information}
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        t={t}
                    />
                ))}
        </View>
    );
};

export default (withTranslation('ImageValidationTutorialIntroScreen')(
    TutorialIntroScreen,
): any);
