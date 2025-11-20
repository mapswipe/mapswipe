// @flow
import * as React from 'react';
import Modal from 'react-native-modal';
import { StyleSheet, View } from 'react-native';
import Button from './Button';
import { COLOR_DEEP_BLUE } from '../constants';
import GLOBAL from '../Globals';

const styles = StyleSheet.create({
    modal: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 2,
        height: null,
        padding: 20,
        width: GLOBAL.SCREEN_WIDTH - 40,
    },
    startButton: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: COLOR_DEEP_BLUE,
        borderRadius: 5,
        borderWidth: 0.1,
        height: 50,
        marginTop: 15,
        padding: 12,
        width: 260,
    },
});

type Props = {
    content: React.Element<any>,
    exitButtonCallback: () => void,
    exitButtonText: string,
    cancelButtonCallback: () => void,
    cancelButtonText: string,
    isVisible: boolean,
};

/*
 * A modal box used to confirm actions, such as leaving the mapper...
 */
export default function ConfirmationModal(props: Props) {
    const {
        cancelButtonCallback,
        cancelButtonText,
        content,
        exitButtonCallback,
        exitButtonText,
        isVisible,
    } = props;

    return (
        <Modal backdropType="blur" position="center" isVisible={isVisible}>
            <View style={styles.modal}>
                {content}
                <Button
                    style={styles.startButton}
                    onPress={cancelButtonCallback}
                    testID="closeIntroModalBoxButton"
                    textStyle={{
                        fontSize: 13,
                        color: '#ffffff',
                        fontWeight: '700',
                    }}
                >
                    {cancelButtonText}
                </Button>
                <Button
                    style={styles.startButton}
                    onPress={exitButtonCallback}
                    testID="closeIntroModalBoxButton"
                    textStyle={{
                        fontSize: 13,
                        color: '#ffffff',
                        fontWeight: '700',
                    }}
                >
                    {exitButtonText}
                </Button>
            </View>
        </Modal>
    );
}
