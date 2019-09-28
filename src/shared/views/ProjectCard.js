// @flow

import React from 'react';
import {
    ImageBackground, Text, View, Image, StyleSheet, TouchableOpacity,
} from 'react-native';
import type { NavigationProp, ProjectType } from '../flow-types';
import {
    COLOR_LIGHT_GRAY,
} from '../constants';

const GLOBAL = require('../Globals');

/* eslint-disable global-require */

/**
 * The ProjectCard class represents a single card instance.
 *
 */

const style = StyleSheet.create({
    largeCard: {
        height: 250,
        width: GLOBAL.SCREEN_WIDTH,
        shadowColor: '#ccc',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        marginTop: 5,
        flex: 1,
    },
    smallCard: {
        height: 250,
        width: GLOBAL.SCREEN_WIDTH * 0.49,
        shadowColor: '#ccc',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        marginTop: 5,
        flex: 1,
    },
    cardBackground: {
        flex: 1,
        overflow: 'hidden',
    },
    offlineIndicator: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        width: 20,
        resizeMode: 'contain',
        right: 5,
        top: -10,
        position: 'absolute',
    },
    bottomTextArea: {
        position: 'absolute',
        flex: 1,
        height: 75,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
        marginLeft: 5,
        marginRight: 5,
        padding: 10,
    },
    bottomTextAreaSmallCard: {
        position: 'absolute',
        flex: 1,
        height: 100,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
        marginLeft: 5,
        marginRight: 5,
        padding: 10,
    },
    projectName: {
        marginBottom: 3,
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0,
        },
    },
    teamMates: {
        borderColor: COLOR_LIGHT_GRAY,
        borderTopWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        flex: 1,
        flexDirection: 'row',
    },
    teamMateText: {
        color: '#ffffff',
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0,
        },
        fontSize: 13,
        marginLeft: 10,
        marginTop: 5,
    },
    heart: {
        width: 13,
        height: 13,
        resizeMode: 'contain',
        marginTop: 5,
    },
    overlay: {
        backgroundColor: 'rgba(52,52,52,0.7)',
        flex: 1,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

type Props = {
    project: ProjectType,
    cardIndex: number,
    navigation: NavigationProp,
}

type State = {
    hasOfflineGroups: boolean,
}

export default class ProjectCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasOfflineGroups: GLOBAL.DB.hasOfflineGroups(`project-${props.project.projectId}`),
        };
    }

    getGradientArray() {
        const { project } = this.props;
        const gradientToPick = parseInt(project.created, 10) % 3;
        let gradientCountArray = null;

        const gradientOpacity = ['0.6', '0.8'];
        switch (gradientToPick) {
        case 0:
            gradientCountArray = [`rgba(12,25,73,${gradientOpacity[0]})`, `rgba(0,0,0,${gradientOpacity[1]})`];
            break;
        case 1:
            gradientCountArray = [`rgba(192,43,43,${gradientOpacity[0]})`, `rgba(0,0,0,${gradientOpacity[1]})`];
            break;
        default:
            gradientCountArray = [`rgba(156,36,189,${gradientOpacity[0]})`, `rgba(0,0,0,${gradientOpacity[1]})`];
            break;
        }
        return gradientCountArray;
    }

    handlePress = () => {
        const { navigation, project } = this.props;
        navigation.push('ProjectView', { project });
    }

    render() {
        const {
            project,
            cardIndex,
        } = this.props;
        const { hasOfflineGroups } = this.state;
        // show progress = 0 if we somehow get a negative value
        const progress = Math.max(0, project.progress).toFixed(0);

        return (
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={this.handlePress}
                testID={`projectCardType${project.projectType}`}
            >
                <View
                    style={[(project.isFeatured ? style.largeCard : style.smallCard),
                        { marginLeft: cardIndex === 1 ? GLOBAL.SCREEN_WIDTH * 0.02 : 0 }]}
                >
                    <ImageBackground
                        style={style.cardBackground}
                        source={{ uri: project.image }}
                    >
                        <View style={style.overlay}>
                            <Image
                                style={[style.offlineIndicator,
                                    { opacity: hasOfflineGroups ? 1 : 0.30 }]}
                                source={require('./assets/offline_icon.png')}
                            />

                            <View style={project.isFeatured
                                ? style.bottomTextArea : style.bottomTextAreaSmallCard}
                            >
                                <Text style={style.projectName}>{project.name}</Text>
                                <View style={style.teamMates}>
                                    <Image
                                        style={style.heart}
                                        source={require('./assets/heart_icon.png')}
                                    />
                                    <Text style={style.teamMateText}>
                                        {`${progress}% by ${project.contributorCount} mappers`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </TouchableOpacity>
        );
    }
}
