// @flow
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR_RED, COLOR_WHITE } from '../../constants';

const styles = StyleSheet.create({
    box: {
        alignSelf: 'center',
        backgroundColor: COLOR_WHITE,
        borderRadius: 5,
        borderColor: COLOR_RED,
        borderWidth: 2,
        // left: '5%',
        padding: 10,
        position: 'absolute',
        top: '15%',
        // width: '90%',
    },
    text: {
        color: COLOR_RED,
    },
});

type Props = {
    onPress: () => void,
};

//  ShowAnswersButton
export default (props: Props) => {
    const { onPress } = props;
    return (
        <View style={styles.box}>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.text}>Show Answers</Text>
            </TouchableOpacity>
        </View>
    );
};
