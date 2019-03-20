// @flow

import React from 'react';
import {
    ImageBackground, Text, View, Image, StyleSheet, TouchableOpacity,
} from 'react-native';
import Button from 'apsl-react-native-button';
import LinearGradient from 'react-native-linear-gradient';
import type { NavigationProp, ProjectType } from '../flow-types';

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
    nowButton: {
        backgroundColor: '#ffffff',
        width: 110,
        height: 20,
        padding: 12,
        borderRadius: 2,
        borderWidth: 0.1,
        top: 5,
        left: 5,
        position: 'absolute',
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
        borderColor: '#e8e8e8',
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
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
    },
});

type Props = {
    card: ProjectType,
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
            hasOfflineGroups: GLOBAL.DB.hasOfflineGroups(`project-${props.card.id}`),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getColorForState(state: number): string {
        switch (state) {
        case 0: return 'red';
        case 1: return 'orange';
        default: return 'green';
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getTextForState(state: number): string {
        switch (state) {
        case 0: return 'NEEDS MAPPING';
        case 1: return 'ON HOLD';
        default: return 'COMPLETE';
        }
    }

    getGradientArray() {
        const { card } = this.props;
        const gradientToPick = card.id % 3;
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
        const { card, navigation } = this.props;
        navigation.push('ProjectView', { project: card });
    }

    render() {
        const {
            card,
            cardIndex,
        } = this.props;
        const { hasOfflineGroups } = this.state;
        return (
            <TouchableOpacity onPress={this.handlePress}>
                <View
                    style={[(card.isFeatured ? style.largeCard : style.smallCard),
                        { marginLeft: cardIndex === 1 ? GLOBAL.SCREEN_WIDTH * 0.02 : 0 }]}
                >
                    <ImageBackground
                        style={style.cardBackground}
                        source={{ uri: card.image }}
                    >
                        <LinearGradient
                            colors={this.getGradientArray()}
                            style={style.linearGradient}
                        />
                        <Image
                            style={[style.offlineIndicator,
                                { opacity: hasOfflineGroups ? 1 : 0.30 }]}
                            source={require('./assets/offline_icon.png')}
                        />

                        <Button
                            style={style.nowButton}
                            textStyle={{
                                fontSize: 10,
                                color: this.getColorForState(card.state),
                                fontWeight: '600',
                            }}
                        >
                            {this.getTextForState(card.state)}
                        </Button>

                        <View style={card.isFeatured
                            ? style.bottomTextArea : style.bottomTextAreaSmallCard}
                        >
                            <Text style={style.projectName}>{card.name}</Text>
                            <View style={style.teamMates}>
                                <Image
                                    style={style.heart}
                                    source={require('./assets/heart_icon.png')}
                                />
                                <Text style={style.teamMateText}>
                                    {`${card.progress.toFixed(0)}% by ${card.contributors} mappers`}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </TouchableOpacity>
        );
    }
}
