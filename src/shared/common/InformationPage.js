// @flow

import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import Markdown from 'react-native-simple-markdown';

import { COLOR_WHITE, SPACING_LARGE } from '../constants';
import { SwipeIconWhite } from './Tutorial/icons';
import type { TranslationFunction, Information } from '../flow-types';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        gap: SPACING_LARGE,
    },
    title: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
    },
    centeredHeader: {
        alignSelf: 'center',
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
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
    tutRow: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
});

type Props = {
    t: TranslationFunction,
    information: Information,
    hideSwipeIcon: boolean,
};
const markdownStyle = {
    text: {
        color: COLOR_WHITE,
        fontSize: 15,
        fontWeight: '400',
    },
};
function InformationPage(props: Props) {
    const { information, t, hideSwipeIcon } = props;

    const sortedBlocks = information?.blocks
        ? [...information?.blocks].sort((a, b) => a.blockNumber - b.blockNumber)
        : undefined;

    return (
        <View style={styles.screenWidth}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: SPACING_LARGE }}
            >
                <View style={styles.tutRow}>
                    <Text style={styles.title}>{information.title}</Text>
                </View>
                {sortedBlocks &&
                    sortedBlocks?.map(block => {
                        if (block.blockType === 'text') {
                            return (
                                <View
                                    style={styles.tutRow}
                                    key={block.blockNumber}
                                >
                                    <Markdown styles={markdownStyle}>
                                        {block.textDescription}
                                    </Markdown>
                                </View>
                            );
                        }
                        return (
                            <View style={styles.tutRow} key={block.blockNumber}>
                                <Image
                                    style={styles.introImage}
                                    source={{ uri: block.image }}
                                />
                            </View>
                        );
                    })}
                {!hideSwipeIcon && (
                    <View
                        style={[
                            styles.tutRow,
                            { alignSelf: 'center', marginTop: 40 },
                        ]}
                    >
                        <Text style={styles.centeredHeader}>
                            {t('swipeToContinue')}
                        </Text>
                        <SwipeIconWhite />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

export default (withTranslation('informationPage')(InformationPage): any);
