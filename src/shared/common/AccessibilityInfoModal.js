import React, { useCallback, useEffect, useRef } from 'react';
import Modal from 'react-native-modalbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, StyleSheet, Image } from 'react-native';
import { Trans } from 'react-i18next';

import {
    COLOR_DEEP_BLUE,
    FONT_SIZE_SMALL,
    HEIGHT_BUTTON,
    SPACING_LARGE,
    SPACING_SMALL,
} from '../constants';
import Button from './Button';
import BadImageIcon from '../views/assets/bad_image_new_icon.png';
import QuestionMarkIcon from '../views/assets/question_mark_new_icon.png';
import TickIcon from '../views/assets/tick_new_icon.png';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    modal: {
        height: 'auto',
        width: GLOBAL.SCREEN_WIDTH - SPACING_LARGE * 2,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        justifyContent: 'center',
        padding: SPACING_LARGE,
    },
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        marginTop: 15,
    },
    text: {
        flex: 1,
        fontSize: FONT_SIZE_SMALL,
        fontWeight: '600',
        color: '#50acd4',
        paddingLeft: 5,
    },
    buttonText: {
        fontSize: 13,
        color: '#ffffff',
        fontWeight: '700',
    },
    image: {
        height: 30,
        width: 30,
        resizeMode: 'contain',
    },
    buttonContainer: {
        display: 'flex',
        marginTop: 24,
    },
    closeButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        alignItems: 'center',
        height: HEIGHT_BUTTON,
        padding: SPACING_SMALL,
        borderRadius: 5,
        borderWidth: 0.1,
    },
});

function AccessibilityInfoModal() {
    const modalRef = useRef();

    const getData = useCallback(async () => {
        try {
            // NOTE: Check if user has visited this route before
            // For simplicity, using a boolean flag stored in AsyncStorage
            const value = await AsyncStorage.getItem('visitedRoute');
            if (value !== null) {
                modalRef.current?.close();
            } else {
                modalRef.current?.open();
            }
        } catch (e) {
            console.log('error', e);
        }
    }, []);

    useEffect(() => {
        getData();
    }, []);

    const closeModal = useCallback(async () => {
        try {
            await AsyncStorage.setItem('visitedRoute', 'true');
            modalRef.current?.close();
        } catch (e) {
            console.log('error', e);
        }
    }, [modalRef]);

    return (
        <Modal
            style={styles.modal}
            entry="bottom"
            position="center"
            swipeToClose
            ref={modalRef}
        >
            <Text style={styles.header}>
                <Trans i18nKey="AccessibilityInstruction:heading">
                    Accessibility Feature
                </Trans>
            </Text>
            <View style={styles.row}>
                <Text>
                    <Trans i18nKey="AccessibilityInstruction:descriptions">
                        Mapping screens now have colored tiles as well as icons
                        to better reflect the meaning.
                    </Trans>
                </Text>
            </View>
            <View style={styles.row}>
                <Image source={TickIcon} style={styles.image} />
                <Text style={styles.text}>
                    <Trans i18nKey="AccessibilityInstruction:tickIconInfo">
                        Tap once to turn the tile green and show a tick icon
                    </Trans>
                </Text>
            </View>
            <View style={styles.row}>
                <Image source={QuestionMarkIcon} style={styles.image} />
                <Text style={styles.text}>
                    <Trans i18nKey="AccessibilityInstruction:questionMarkIconInfo">
                        Tap twice to turn the tile yellow and show a question
                        icon
                    </Trans>
                </Text>
            </View>
            <View style={styles.row}>
                <Image source={BadImageIcon} style={styles.image} />
                <Text style={styles.text}>
                    <Trans i18nKey="AccessibilityInstruction:badImageIconInfo">
                        Tap thrice to turn the tile red and show a bad imagery
                        icon
                    </Trans>
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.text}>
                    <Trans i18nKey="AccessibilityInstruction:turnOnOffDescription">
                        Turn on/off the feature by visiting the Settings section
                        under Profile
                    </Trans>
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    style={styles.closeButton}
                    onPress={closeModal}
                    textStyle={styles.buttonText}
                >
                    Don&apos;t show me this again
                </Button>
            </View>
        </Modal>
    );
}
export default AccessibilityInfoModal;
