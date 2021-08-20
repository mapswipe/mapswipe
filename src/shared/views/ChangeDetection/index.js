// @flow
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { submitChange } from '../../actions/index';
import ChangeDetectionBody from './Body';
import type { NavigationProp } from '../../flow-types';

const styles = StyleSheet.create({
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
});

type Props = {
    navigation: NavigationProp,
    tutorial: boolean,
};

/* eslint-disable react/destructuring-assignment */
export default class ChangeDetectionScreen extends React.Component<Props> {
    randomSeed: number;

    // TODO: this is not used at the moment.
    tutorialHelpContent: React.Node = (
        <View>
            <Text style={styles.tutPar}>Welcome to the tutorial!</Text>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    This should make you a wizard of MapSwipe in a few minutes.
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    Just follow the instructions on the screen, and swipe left
                    to continue.
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    If the instructions are in your way, just tap the message
                    box to move it.
                </Text>
            </View>
        </View>
    );

    constructor(props: Props) {
        super(props);
        // this random value is used to pick a group when mapping starts,
        // it cannot be picked within mapStateToProps, as the latter must be
        // a pure function (adding randomness in it causes an infinite loop
        // of rendering). Here seems like a good place, as it is set once
        // for the lifetime of the component.
        this.randomSeed = Math.random();
    }

    /* eslint-enable global-require */
    render(): React.Node {
        const { navigation, tutorial } = this.props;
        const projectObj = navigation.getParam('project', false);
        // check that the project data has a tutorialId set (in firebase)
        // in which case, we use it as the tutorial (all projects should have one)
        let tutorialId;
        if (projectObj.tutorialId !== undefined) {
            tutorialId = projectObj.tutorialId;
        } else {
            console.warn('No tutorial defined for the project');
            // we should never get to this point, as we catch the lack of tutorial
            // earlier, but just in case: abort and go back to the previous screen,
            // this is a bit ugly, but will prevent a crash for now
            navigation.pop();
        }

        return (
            <ChangeDetectionBody
                navigation={navigation}
                randomSeed={this.randomSeed}
                screenName="_ChangeDetectionScreen"
                submitResultFunction={submitChange}
                tutorial={tutorial}
                tutorialId={tutorialId}
            />
        );
    }
}
