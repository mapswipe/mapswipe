import React from "react";
import createReactClass from 'create-react-class';
import { ImageBackground, Text, View, Image, StyleSheet, Dimensions, TouchableOpacity} from "react-native";
import Button from "apsl-react-native-button";
import LinearGradient from "react-native-linear-gradient";

var GLOBAL = require('../Globals');


/**
 * The ProjectCard class represents a single card instance.
 *
 */


var style = StyleSheet.create({
    largeCard: {
        height: 250,
        width: GLOBAL.SCREEN_WIDTH,
        shadowColor: '#ccc',
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.5,
        marginTop: 5,
    },
    groupAvatarBorderRadiusFix: {
        position: 'absolute',
        top: -10,
        right: -10,
        bottom: -10,
        left: -10,
        borderRadius: 29,
        borderWidth: 10,
        borderColor: '#212121',
    },
    smallCard: {
        height: 250,
        width: GLOBAL.SCREEN_WIDTH * 0.49,
        shadowColor: '#ccc',
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 3,
        marginTop: 5,
    },
    cardBackground: {
        flex: 1,
        overflow: 'hidden'
    },
    circle: {
        width: 5,
        height: 5,
        borderRadius: 100 / 2,
        backgroundColor: '#ee0000'
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
        position: 'absolute'
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
        shadowColor: "#000000",
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
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

var ProjectCard = createReactClass({

    getInitialState() {
        return {
            hasOfflineGroups: GLOBAL.DB.hasOfflineGroups('project-' + this.props.card.id)
        }
    },

    _getColorForState(state) {
        if (state === 0) {
            return 'red';
        } else if (state === 1) {
            return 'orange';
        } else if (state === 2) { //complete
            return 'green';
        }
    },
    _getTextForState(state) {

        if (state === 2) {
            return 'COMPLETE';
        }
        if (state === 1) {
            return 'ON HOLD';
        }

        // if the state is not any of these,

        if (state === 0) {
            return 'NEEDS MAPPING';
        }
    },
    _handlePress() {
        this.props.navigator.push({id: 2, data: this.props.card});
        //console.log(event);
    },

    getGradientArray() {

        var gradientToPick = this.props.card.id % 3;
        var gradientCountArray = null;

        var gradientOpacity = ["0.6", "0.8"];
        switch (gradientToPick) {

            case 0:
                gradientCountArray = ['rgba(12,25,73,' + gradientOpacity[0] + ')', 'rgba(0,0,0,' + gradientOpacity[1] + ')'];
                break;
            case 1:
                gradientCountArray = ['rgba(192,43,43,' + gradientOpacity[0] + ')', 'rgba(0,0,0,' + gradientOpacity[1] + ')'];
                break;
            case 2:
                gradientCountArray = ['rgba(156,36,189,' + gradientOpacity[0] + ')', 'rgba(0,0,0,' + gradientOpacity[1] + ')'];
                break;
        }


        return gradientCountArray;
    },
    render() {
        const { card } = this.props;
        return (
            <TouchableOpacity onPress={this._handlePress}>
                <View
                    style={[(this.props.featured === true ? style.largeCard : style.smallCard), {marginLeft: this.props.cardIndex === 1 ? GLOBAL.SCREEN_WIDTH * 0.02 : 0}]}>
                    <ImageBackground
                        style={style.cardBackground}
                        source={{uri: card.image}}
                    >
                        <LinearGradient
                            colors={this.getGradientArray()}
                            style={style.linearGradient}
                        />
                        <Image
                            style={[style.offlineIndicator, {opacity: this.state.hasOfflineGroups ? 1 : 0.30}]}
                            source={require('./assets/offline_icon.png')}
                        />

                        <Button
                            style={style.nowButton}
                            textStyle={{
                                fontSize: 10,
                                color: this._getColorForState(card.state),
                                fontWeight: '600',
                            }}
                        >
                            {this._getTextForState(card.state)}
                        </Button>

                        <View style={this.props.featured === true ? style.bottomTextArea : style.bottomTextAreaSmallCard}>
                            <Text style={style.projectName}>{card.name}</Text>
                            <View style={style.teamMates}>
                                <Image
                                    style={style.heart}
                                    source={require('./assets/heart_icon.png')}
                                />
                                <Text style={style.teamMateText}>
                                    {`${card.progress}% by ${card.contributors} mappers`}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </TouchableOpacity>
        );
    },
});


module.exports = ProjectCard;
