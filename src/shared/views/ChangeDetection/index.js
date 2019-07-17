// @flow
import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import ProjectLevelScreen from '../../common/ProjectLevelScreen';
import {
    submitChange,
} from '../../actions/index';
import ChangeDetector from './ChangeDetector';
import type {
    NavigationProp,
} from '../../flow-types';
import {
    COLOR_GREEN,
    COLOR_DARK_GRAY,
    COLOR_RED,
    COLOR_YELLOW,
} from '../../constants';

const styles = StyleSheet.create({
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    tutRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tutPar: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.54)',
        fontWeight: '500',
        lineHeight: 20,
    },
    tutText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 10,
        width: 150,
    },
    tutImage: {
        height: 30,
        resizeMode: 'contain',
    },
});

type Props = {
    navigation: NavigationProp,
};

/* eslint-disable react/destructuring-assignment */
export default class ChangeDetectionScreen extends React.Component<Props> {
    /* eslint-disable global-require */
    normalHelpContent = (
        <>
            <Text style={styles.header}>How To Contribute</Text>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    Look at the images before (top) and after (bottom)
                    and decide whether you see any of the changes mentioned
                    in the brief at the top of the screen.
                    Swipe anywhere on the screen to answer:
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Image
                    source={require('../assets/swiperight_icon_black.png')}
                    style={styles.tutImage}
                />
                <Text style={[styles.tutText, { color: COLOR_GREEN }]}>
                    Right if you see changes
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Image
                    source={require('../assets/swipeleft_icon_black.png')}
                    style={styles.tutImage}
                />
                <Text style={[styles.tutText, { color: COLOR_DARK_GRAY }]}>
                    Left if you don&apos;t see changes
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Image
                    source={require('../assets/swipedown_icon_black.png')}
                    style={styles.tutImage}
                />
                <Text style={[styles.tutText, { color: COLOR_YELLOW }]}>
                    Down if you&apos;re unsure
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Image
                    source={require('../assets/swipeup_icon_black.png')}
                    style={styles.tutImage}
                />
                <Text style={[styles.tutText, { color: COLOR_RED }]}>
                    Up if there is no image, or it&apos;s cloudy
                </Text>
            </View>
        </>
    );
    /* eslint-enable global-require */

    tutorialHelpContent = (
        <View>
            <Text style={styles.tutPar}>
                Welcome to the tutorial!
            </Text>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    This should make you a wizard of Mapswipe
                    in a few minutes.
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    Just follow the instructions on the screen,
                    and swipe left to continue.
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    If the instructions are in your way,
                    just tap the message box to move it.
                </Text>
            </View>
        </View>
    );

    render() {
        const { navigation } = this.props;
        return (
            <ProjectLevelScreen
                Component={ChangeDetector}
                navigation={navigation}
                normalHelpContent={this.normalHelpContent}
                screenName="_ChangeDetectionScreen"
                submitResultFunction={submitChange}
                tutorialHelpContent={this.tutorialHelpContent}
            />
        );
    }
}
