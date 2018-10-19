import React from "react";
import createReactClass from 'create-react-class';
import { Text, View, Platform, ScrollView, StyleSheet, Linking } from "react-native";
import ScrollableTabView from "react-native-scrollable-tab-view";
import Button from "apsl-react-native-button";

var store = require('react-native-simple-store');
var GLOBAL = require('../Globals');

/**
 * Import the project card component
 * @type {ProjectCard|exports|module.exports}
 */

var ProjectCard = require('./ProjectCard');
var MoreOptions = require('./MoreOptions');
var Modal = require('react-native-modalbox');
var LoadingIcon = require('./LoadingIcon');
var MapswipeTabBar = require('./MapswipeTabBar');


/**
 * Styling properties for the class
 */


var style = StyleSheet.create({
    inModalButton2: {
        backgroundColor: '#ee0000',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
        marginTop: 20
    },
    inModalButton: {
        backgroundColor: '#0d1949',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
    },
    listView: {
        width: GLOBAL.SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center'

    },
    otherButton: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 30,
        padding: 12,
        marginTop: 10,
        borderWidth: 0,
    },
    startButton: {
        backgroundColor: '#0d1949',
        alignItems: 'stretch',

        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 260
    },
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,

    },
    tutRow: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: 40,
    },

    tutPar: {
        fontSize: 14,
        color: '#575757',
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 10,
    },

    tutText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#50acd4',
        marginTop: 10,
        lineHeight: 20,
    },


    modal: {
        padding: 20,
    },

    modal2: {
        height: 230,
        backgroundColor: "#3B5998"
    },

    modal3: {
        marginTop: 10,
        height: 300,
        width: 300,
        backgroundColor: "#ffffff",
        borderRadius: 2
    },


    cardRow: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        width: GLOBAL.SCREEN_WIDTH,
    }

});

// todo: put flexDirection:'column', justifyContent:'center' and fix 50% issues

/**
 * This is the base view for the project navigation, the individual tabs are rendered within here.
 */

var ProjectNav = createReactClass({

    componentDidMount() {

      //GLOBAL.ANALYTICS.logEvent('app_home_seen');
        console.log("Firing sync");
        // attempt to sync any unsynced data from last time.
        GLOBAL.DB.syncAndDeIndex().then(data => {
            console.log("SyncAndDeIndex complete:");
            console.log(data);
            // if(data.successCount === 0 || data.errorCount > 0) {
            this.props.messageBar.showAlert({
                title: data.successCount + " tasks synced",
                message: data.errorCount + " failures",
                alertType: 'success',
            });
            //}
        }).catch(error => {
            this.props.messageBar.showAlert({
                title: data.successCount + " tasks synced",
                message: data.errorCount + " failures",
                alertType: 'error',
            });
        });
    },

    render() {
        return <ScrollableTabView
            tabBarActiveTextColor="#ffffff"
            tabBarInactiveTextColor="#e8e8e8"
            tabBarInactiveUnderlineColor="#212121"
            tabBarUnderlineColor="#ee0000"
            renderTabBar={() => <MapswipeTabBar backgroundColor='#0d1949' />}
        >
            <View style={{ flex: 1 }} tabLabel='Missions'><RecommendedCards navigator={this.props.navigator} /></View>
            <View style={{ flex: 1 }} tabLabel='More'><MoreOptions navigator={this.props.navigator} /></View>
        </ScrollableTabView>;
    },
});


var RecommendedCards = createReactClass({

    openModal3: function (id) {
        var parent = this;

        GLOBAL.DB.openPopup().then(data => {
            console.log("No need to open new tut window")
        }).catch(err => {
            parent.refs.modal3.open();
        })
    },

    closeModal3: function (id) {
        this.refs.modal3.close();
        GLOBAL.DB.stopPopup();
    },

    componentDidMount() {
        // get nounouncement, then pop up modal

        var parent = this;
        GLOBAL.DB.getAnnouncement().then(data => {
            this.setState({
                announcement: data,
                projects: this.state.projects

            });
            parent.openModal3();
        });
    },

    testingImages: [],


    /**
     * Updates the projects on the main project view
     * @param newCards
     * @param updateDb
     */
    updateProjects: function (newCards) {
        this.setState({ projects: newCards, announcement: this.state.announcement });
    },
    /**
     * Get the initial project state, load from database if necessary.
     * @returns {{dataSource}}
     */
    getInitialState: function () {


        // get the projects
        GLOBAL.DB.getProjects().then((data) => {
            console.log("koolio");
            console.log(data);
            this.updateProjects(data);
        }).catch(function (error) {
            console.log("Show error here");
            console.log(error);
        });

        return {
            projects: {
                featuredCard: null,
                otherCards: []
            },
            announcement: null
        };
    },
    render() {
        var rows = [];

        if (this.state.announcement !== null) {
            rows.push(<Button
                onPress={() => {
                    this.props.navigator.push({ id: 5, data: this.state.announcement.url, paging: true })
                }}
                key={'announce'}
                style={style.otherButton}
                textStyle={{
                    fontSize: 13,
                        color: '#0d1949',
                        fontWeight: '700'
                }}>{this.state.announcement.text}</Button>);
        }

        if (this.state.projects.featuredCard !== null) {
            rows.push(<FeaturedCard
                key={rows.length}
                navigator={this.props.navigator}
                card={this.state.projects.featuredCard}
                />);
        } else {
            rows.push(<LoadingIcon key={'icon'} />);
        }

        var parent = this;
        this.state.projects.otherCards.forEach(function (cardRow) {
            rows.push(<CardRow key={rows.length} navigator={parent.props.navigator} cardRow={cardRow} />)
        });

        rows.push(<Modal
            key='modal'
            style={[style.modal, style.modal3]} backdropType="blur" position={"top"} ref={"modal3"}
            isDisabled={this.state.isDisabled}>
            <Text style={style.header}>Tutorial</Text>
            <Text style={style.tutPar}>Learn more about how to use Mapswipe!</Text>
            <Button style={style.inModalButton2} onPress={() => {
                this.closeModal3();
                this.props.navigator.push({ id: 5, data: GLOBAL.TUT_LINK, paging: true })
            }} textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                Go To Tutorial
            </Button>
            <Button style={style.inModalButton} onPress={this.closeModal3}
                textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}>
                No thanks
            </Button>
        </Modal>);

        return <ScrollView contentContainerStyle={style.listView}
            removeClippedSubviews={true}
            navigator={this.props.navigator}
        >
            {rows}
        </ScrollView>
            ;
    },
});

var FeaturedCard = createReactClass({


    render() {
        return <View navigator={this.props.navigator} style={style.cardRow}>
            <ProjectCard navigator={this.props.navigator} card={this.props.card} featured={true} />
        </View>
    },
});

var CardRow = createReactClass({

    render() {
        //var rows = [];
        //for (var i = 0; i < this.props.cardRow.cards.length; i++) {
        const rows = this.props.cardRow.cards.map((card, index) => (
            <ProjectCard
            navigator={this.props.navigator}
            card={card}
            cardIndex={index}
            key={card.id}
            featured={false}
            />
        ));
        return <View navigator={this.props.navigator} style={style.cardRow}>
            {rows}
        </View>;
    },
});


module.exports = ProjectNav;
