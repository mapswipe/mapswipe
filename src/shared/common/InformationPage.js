// @flow

import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';

import { COLOR_WHITE, SPACING_LARGE } from '../constants';
import { SwipeIconWhite } from './Tutorial/icons';
import type { TranslationFunction } from '../flow-types';

const GLOBAL = require('../Globals');

export type Block =
    | {
          blockNumber: number,
          blockType: 'image',
          image: string,
      }
    | {
          blockNumber: number,
          blockType: 'text',
          textDescription: string,
      };

export type ProjectInformation = Array<Block[]>;

const styles = StyleSheet.create({
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
    introImage: {
        height: 150,
        width: '100%',
        marginBottom: 15,
        marginTop: 15,
    },
    screenWidth: {
        width: GLOBAL.SCREEN_WIDTH,
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
});

type Props = {
    t: TranslationFunction,
    information: Block[],
};

function InformationPage(props: Props) {
    const { information, t } = props;
    return (
        <View style={styles.screenWidth}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: SPACING_LARGE }}
            >
                {information
                    ?.sort((a, b) => a.blockNumber - b.blockNumber)
                    ?.map(block => {
                        if (block.blockType === 'text') {
                            return (
                                <View
                                    style={styles.tutRow}
                                    key={block.blockNumber}
                                >
                                    <Text
                                        style={[
                                            styles.tutText,
                                            { marginLeft: 0 },
                                        ]}
                                    >
                                        {block.textDescription}
                                    </Text>
                                </View>
                            );
                        }
                        return (
                            <View style={styles.tutRow} key={block.blockNumber}>
                                <Image
                                    resizeMode="contain"
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
                        {t('swipeToContinue')}
                    </Text>
                    <SwipeIconWhite />
                </View>
            </ScrollView>
        </View>
    );
}

export default (withTranslation('informationPage')(InformationPage): any);
