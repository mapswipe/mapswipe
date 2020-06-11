// @flow
import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';
import type { LanguageData } from '../../flow-types';

const styles = StyleSheet.create({
    checkmark: {
        height: 40,
        marginVertical: 5,
        resizeMode: 'contain',
        width: 50,
    },
    langName: {
        backgroundColor: COLOR_DEEP_BLUE,
        color: COLOR_WHITE,
        paddingLeft: 5,
    },
});

type Props = {
    langData: LanguageData,
    onSelectLanguage: (string) => void,
    selected: boolean,
};

/* eslint-disable global-require */
const LanguageItem = (props: Props) => {
    const { langData, onSelectLanguage, selected } = props;
    return (
        <TouchableHighlight onPress={() => onSelectLanguage(langData.code)}>
            <View
                style={{
                    alignItems: 'center',
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                }}
            >
                {selected ? (
                    <Image
                        source={require('../../views/assets/checkmark_white.png')}
                        style={styles.checkmark}
                    />
                ) : (
                    <View style={styles.checkmark} />
                )}
                <Text
                    style={[
                        styles.langName,
                        { fontWeight: selected ? 'bold' : 'normal' },
                    ]}
                >
                    {langData.name}
                </Text>
            </View>
        </TouchableHighlight>
    );
};

export default LanguageItem;
