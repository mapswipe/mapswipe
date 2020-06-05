// @flow
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProjectLevelScreen from '../../common/ProjectLevelScreen';
import { submitFootprint } from '../../actions/index';
import Validator from './Validator';
import type { NavigationProp } from '../../flow-types';
import { COLOR_GREEN, COLOR_RED, COLOR_YELLOW } from '../../constants';

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
    },
});

type Props = {
    navigation: NavigationProp,
};

/* eslint-disable react/destructuring-assignment */
export default class BuildingFootprintScreen extends React.Component<Props> {
    randomSeed: number;

    constructor(props: Object) {
        super(props);
        // this random value is used to pick a group when mapping starts,
        // it cannot be picked within mapStateToProps, as the latter must be
        // a pure function (adding randomness in it causes an infinite loop
        // of rendering). Here seems like a good place, as it is set once
        // for the lifetime of the component.
        this.randomSeed = Math.random();
    }

    /* eslint-disable global-require */
    getNormalHelpContent = () => (
        <>
            <Text style={styles.header}>How To Contribute</Text>
            <View style={styles.tutRow}>
                <Text style={styles.tutPar}>
                    Look at the red shape on top of the imagery and decide if it
                    matches the building underneath it. Tap one of the 3 buttons
                    to answer:
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={[styles.tutText, { color: COLOR_GREEN }]}>
                    Looks good: the shape matches the image
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={[styles.tutText, { color: COLOR_YELLOW }]}>
                    Needs adjustment if they don&apos;t align properly
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={[styles.tutText, { color: COLOR_RED }]}>
                    No building if the shape doesn&apos;t overlap with any
                    building
                </Text>
            </View>
            <View style={styles.tutRow}>
                <Text style={styles.tutText}>
                    If unsure, answer &quot;Needs adjustment&quot;
                </Text>
            </View>
        </>
    );

    /* eslint-enable global-require */
    render() {
        const { navigation } = this.props;
        return (
            <ProjectLevelScreen
                Component={Validator}
                navigation={navigation}
                getNormalHelpContent={this.getNormalHelpContent}
                randomSeed={this.randomSeed}
                screenName="BuildingFootprintScreen"
                submitResultFunction={submitFootprint}
                tutorialName="building_footprint_tutorial"
            />
        );
    }
}
