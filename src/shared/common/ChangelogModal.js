import React, {
    useCallback,
    useRef,
    useMemo,
    useEffect,
    useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modalbox';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

import allChangelogs from '../../../changelog';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    FONT_SIZE_LARGE,
    FONT_SIZE_SMALL,
    FONT_WEIGHT_BOLD,
    HEIGHT_BUTTON_SMALL,
    RADIUS_BORDER_MEDIUM,
    SPACING_EXTRA_SMALL,
    SPACING_LARGE,
    WIDTH_MAX_MODAL_SMALL,
} from '../constants';
import Button from './Button';

const style = StyleSheet.create({
    headingText: {
        color: COLOR_DARK_GRAY,
        fontSize: FONT_SIZE_LARGE,
        fontWeight: FONT_WEIGHT_BOLD,
        marginBottom: SPACING_EXTRA_SMALL,
    },

    changeList: {
        marginVertical: SPACING_LARGE,
    },

    listIndicator: {
        marginRight: SPACING_EXTRA_SMALL,
    },

    changeView: {
        display: 'flex',
        flexDirection: 'row',
    },

    closeButtonText: {
        fontSize: FONT_SIZE_SMALL,
    },

    closeButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        alignItems: 'center',
        height: HEIGHT_BUTTON_SMALL,
        borderRadius: 5,
    },

    changelogModal: {
        height: 'auto',
        padding: SPACING_LARGE,
        maxWidth: WIDTH_MAX_MODAL_SMALL,
        borderRadius: RADIUS_BORDER_MEDIUM,
    },
});

function parseVersion(versionStr) {
    const splits = versionStr.split(' ');
    const versionNumbers = splits[0].split('.');
    const [majorStr, minorStr, patchStr] = versionNumbers;

    const numberPattern = /\d+/;
    const buildStr = splits[1] ? splits[1].match(numberPattern)[0] : undefined;

    return {
        major: parseInt(majorStr, 10),
        minor: parseInt(minorStr, 10),
        patch: parseInt(patchStr, 10),
        build: buildStr ? parseInt(buildStr, 10) : undefined,
    };
}

function getVersionInfo() {
    const currentVersion = DeviceInfo.getVersion();
    if (!currentVersion) {
        return undefined;
    }

    return parseVersion(currentVersion);
}

const LAST_VIEWED_CHANGELOG_VERSION_KEY = 'lastViewedChangelogVersion';

function ChangelogModal() {
    const changelogModalRef = useRef();
    const [hasUnseenChangelogs, setHasUnseenChangelogs] = useState(false);

    const currentVersion = useMemo(() => getVersionInfo(), []);
    const currentVersionStr = useMemo(() => {
        const { major, minor, patch } = currentVersion;
        return `${major}.${minor}.${patch}`;
    }, [currentVersion]);

    useEffect(() => {
        async function checkLastViewedChangelogVersion() {
            const lastViewedChangelogVersionStr = await AsyncStorage.getItem(
                LAST_VIEWED_CHANGELOG_VERSION_KEY,
            );

            if (!lastViewedChangelogVersionStr) {
                setHasUnseenChangelogs(true);
                return;
            }

            if (lastViewedChangelogVersionStr === currentVersionStr) {
                return;
            }

            const lastViewedVersion = parseVersion(
                lastViewedChangelogVersionStr,
            );

            const majorDiff = currentVersion.major - lastViewedVersion.major;
            const minorDiff = currentVersion.minor - lastViewedVersion.minor;
            const patchDiff = currentVersion.patch - lastViewedVersion.patch;

            if (majorDiff <= 0 && minorDiff <= 0 && patchDiff <= 0) {
                return;
            }

            setHasUnseenChangelogs(true);
        }

        checkLastViewedChangelogVersion();
    }, [currentVersionStr, currentVersion]);

    const handleChangelogCloseButtonClick = useCallback(() => {
        if (changelogModalRef.current) {
            changelogModalRef.current.close();
        }
    }, []);

    const handleChangelogModalClose = useCallback(() => {
        AsyncStorage.setItem(
            LAST_VIEWED_CHANGELOG_VERSION_KEY,
            currentVersionStr,
        );
    }, []);

    const currentVersionChanges = useMemo(() => {
        if (!currentVersionStr) {
            return undefined;
        }

        return allChangelogs[currentVersionStr]?.changes;
    }, [currentVersionStr]);

    if (!currentVersionChanges || !hasUnseenChangelogs) {
        return null;
    }

    return (
        <Modal
            isOpen
            position="center"
            coverScreen={false}
            style={style.changelogModal}
            backdropPressToClose={false}
            ref={changelogModalRef}
            onClosed={handleChangelogModalClose}
        >
            <Text style={style.headingText}>MapSwipe has been updated!</Text>
            <Text>
                Here&apos;s a summary of what&apos;s changed in v
                {currentVersionStr}
            </Text>
            <View style={style.changeList}>
                {currentVersionChanges.map(change => (
                    <View key={change} style={style.changeView}>
                        <Text style={style.listIndicator}>-</Text>
                        <Text key={change}>{change}</Text>
                    </View>
                ))}
            </View>
            <Button
                style={style.closeButton}
                onPress={handleChangelogCloseButtonClick}
                textStyle={style.closeButtonText}
            >
                Close
            </Button>
        </Modal>
    );
}

export default ChangelogModal;
