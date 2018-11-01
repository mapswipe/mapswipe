import React from 'react';
import {
    Text, View, ScrollView, StyleSheet,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Button from 'apsl-react-native-button';

const MessageBarManager = require('react-native-message-bar').MessageBarManager;

const Modal = require('react-native-modalbox');
const GLOBAL = require('../Globals');

/**
 * Import the project card component
 * @type {ProjectCard|exports|module.exports}
 */

const ProjectCard = require('./ProjectCard');
const MoreOptions = require('./MoreOptions');
const LoadingIcon = require('./LoadingIcon');


/**
 * Styling properties for the class
 */


const style = StyleSheet.create({
    inModalButton2: {
        backgroundColor: '#ee0000',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
        marginTop: 20,
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
        justifyContent: 'center',

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
        width: 260,
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
        backgroundColor: '#3B5998',
    },

    modal3: {
        marginTop: 10,
        height: 300,
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },

    cardRow: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        width: GLOBAL.SCREEN_WIDTH,
    },

});

// todo: put flexDirection:'column', justifyContent:'center' and fix 50% issues

/**
 * This is the base view for the project navigation, the individual tabs are rendered within here.
 */

class ProjectNav extends React.Component {
    componentDidMount() {
        // GLOBAL.ANALYTICS.logEvent('app_home_seen');
        console.log('Firing sync');
        // attempt to sync any unsynced data from last time.
        GLOBAL.DB.syncAndDeIndex().then((data) => {
            console.log('SyncAndDeIndex complete:');
            console.log(data);
            // if(data.successCount === 0 || data.errorCount > 0) {
            MessageBarManager.showAlert({
                title: `${data.successCount} tasks synced`,
                message: `${data.errorCount} failures`,
                alertType: 'success',
            });
            // }
        }).catch((error) => {
            console.warn('pbpbpb', error);
            MessageBarManager.showAlert({
                title: `${data.successCount} tasks synced`,
                message: `${data.errorCount} failures`,
                alertType: 'error',
            });
        });
    }

    render() {
        console.log('render ProjectNav');
        return (
            <ScrollableTabView
                tabBarActiveTextColor="#ffffff"
                tabBarInactiveTextColor="#e8e8e8"
                tabBarUnderlineStyle={{ backgroundColor: '#ee0000' }}
                renderTabBar={() => <DefaultTabBar backgroundColor="#0d1949" style={{ borderBottomWidth: 0 }} />}
            >
                <View style={{ flex: 1 }} tabLabel="Missions">
                    <RecommendedCards navigation={this.props.navigation} />
                </View>
                <View style={{ flex: 1 }} tabLabel="More">
                    <MoreOptions navigation={this.props.navigation} />
                </View>
            </ScrollableTabView>
        );
    }
}


class RecommendedCards extends React.Component {
    openModal3 = () => {
        const parent = this;

        GLOBAL.DB.openPopup().then((data) => {
            console.log('No need to open new tut window');
        }).catch((err) => {
            parent.refs.modal3.open();
        });
    }

    closeModal3 = (id) => {
        this.refs.modal3.close();
        GLOBAL.DB.stopPopup();
    }

    componentDidMount() {
        // get nounouncement, then pop up modal

        const parent = this;
        GLOBAL.DB.getAnnouncement().then((data) => {
            this.setState({
                announcement: data,
                projects: this.state.projects,

            });
            parent.openModal3();
        });
    }

    testingImages: [];


    /**
     * Updates the projects on the main project view
     * @param newCards
     * @param updateDb
     */
    updateProjects = (newCards) => {
        console.log('updateProjects', newCards);
        this.setState({ loadingProjects: false, projects: newCards, announcement: this.state.announcement });
    }

    /**
     * Get the initial project state, load from database if necessary.
     * @returns {{dataSource}}
     */
    constructor(props) {
        super(props);
        console.log('construct RecommendedCards');
        // get the projects
        GLOBAL.DB.getProjects().then((data) => {
            console.log('Received project list from DB', data);
            this.updateProjects(data);
        }).catch((error) => {
            console.log('Error fetching projects', error);
        });

        this.state = {
            loadingProjects: true,
            projects: {
                featuredCard: null,
                otherCards: [],
            },
            announcement: null,
        };
    }

    render() {
        const rows = [];

        if (this.state.announcement !== null) {
            rows.push(<Button
                onPress={() => {
                    this.props.navigation.push('WebviewWindow', {
                        url: this.state.announcement.url,
                    });
                }}
                key="announce"
                style={style.otherButton}
                textStyle={{
                    fontSize: 13,
                    color: '#0d1949',
                    fontWeight: '700',
                }}
            >
                {this.state.announcement.text}
            </Button>);
        }

        if (this.state.loadingProjects) {
            rows.push(<LoadingIcon key="icon" />);
        } else {
            if (this.state.projects.featuredCard !== null) {
                rows.push(<FeaturedCard
                    key={rows.length}
                    navigation={this.props.navigation}
                    card={this.state.projects.featuredCard}
                />);
            }
            const parent = this;
            this.state.projects.otherCards.forEach((cardRow) => {
                rows.push(<CardRow key={rows.length} navigation={parent.props.navigation} cardRow={cardRow} />);
            });
        }

        rows.push(<Modal
            key="modal"
            style={[style.modal, style.modal3]}
            backdropType="blur"
            position="top"
            ref="modal3"
            isDisabled={this.state.isDisabled}
        >
            <Text style={style.header}>Tutorial</Text>
            <Text style={style.tutPar}>Learn more about how to use Mapswipe!</Text>
            <Button
                style={style.inModalButton2}
                onPress={() => {
                    this.closeModal3();
                    this.props.navigation.push('WebviewWindow', {
                        uri: GLOBAL.TUT_LINK,
                    });
                }}
                textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
            >
                Go To Tutorial
            </Button>
            <Button
                style={style.inModalButton}
                onPress={this.closeModal3}
                textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
            >
                No thanks
            </Button>
        </Modal>);

        return (
            <ScrollView
                contentContainerStyle={style.listView}
                removeClippedSubviews
                navigation={this.props.navigation}
            >
                {rows}
            </ScrollView>
        );
    }
}

class FeaturedCard extends React.Component {
    render() {
        return (
            <View navigation={this.props.navigation} style={style.cardRow}>
                <ProjectCard navigation={this.props.navigation} card={this.props.card} featured />
            </View>
        );
    }
}

class CardRow extends React.Component {
    render() {
        // var rows = [];
        // for (var i = 0; i < this.props.cardRow.cards.length; i++) {
        const rows = this.props.cardRow.cards.map((card, index) => (
            <ProjectCard
                navigation={this.props.navigation}
                card={card}
                cardIndex={index}
                key={card.id}
                featured={false}
            />
        ));
        return (
            <View navigation={this.props.navigation} style={style.cardRow}>
                {rows}
            </View>
        );
    }
}


module.exports = ProjectNav;
