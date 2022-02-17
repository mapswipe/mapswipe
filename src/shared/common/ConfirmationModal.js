// @flow
import * as React from 'react';
import Modal from 'react-native-modalbox';
import { StyleSheet } from 'react-native';
import Button from './Button';
import { COLOR_DEEP_BLUE } from '../constants';

const styles = StyleSheet.create({
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: 2,
        height: null,
        padding: 20,
        width: 300,
    },
    startButton: {
        alignItems: 'center',
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
    getRef: any => void,
};

export default class ConfirmationModal extends React.Component<Props> {
    /*
     * A modal box used to confirm actions, such as leaving the mapper...
     */
    render(): React.Node {
        const {
            cancelButtonCallback,
            cancelButtonText,
            content,
            exitButtonCallback,
            exitButtonText,
            getRef,
        } = this.props;
        return (
            <Modal
                animationDuration={150}
                style={styles.modal}
                backdropType="blur"
                position="center"
                ref={r => {
                    getRef(r);
                }}
            >
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
            </Modal>
        );
    }
}
