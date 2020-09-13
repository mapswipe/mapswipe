// @flow
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import { COLOR_RED, COLOR_WHITE } from '../../constants';
import type { TranslationFunction } from '../../flow-types';

const styles = StyleSheet.create({
    box: {
        alignSelf: 'center',
        backgroundColor: COLOR_WHITE,
        borderRadius: 5,
        borderColor: COLOR_RED,
        borderWidth: 2,
        padding: 10,
        position: 'absolute',
        top: '15%',
    },
    text: {
        color: COLOR_RED,
    },
});

type Props = {
    onPress: () => void,
    t: TranslationFunction,
};

const ShowAnswersButton = (props: Props) => {
    const { onPress, t } = props;
    return (
        <View style={styles.box}>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.text}>{t('showAnswers')}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default withTranslation('ShowAnswersButton')(ShowAnswersButton);
