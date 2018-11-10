import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    Text, View, ScrollView, StyleSheet,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

import { requestProjects } from '../actions/index';
import { RecommendedCards } from './RecommendedCards';
import { MoreOptions } from './MoreOptions';

const MessageBarManager = require('react-native-message-bar').MessageBarManager;

const GLOBAL = require('../Globals');

/**
 * Import the project card component
 * @type {ProjectCard|exports|module.exports}
 */

const ProjectCard = require('./ProjectCard');
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
    modal2: {
        height: 230,
        backgroundColor: '#3B5998',
    },
    cardRow: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        width: GLOBAL.SCREEN_WIDTH,
    },
});

/**
 * This is the base view for the project navigation, the individual tabs are rendered within here.
 */

class _ProjectNav extends React.Component {
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
        }).then(() => {
            // request projects and announcements from firebase
            this.props.onRequestProjects();
        });
    }

    render() {
        const { navigation, profile } = this.props;
        return (
            <ScrollableTabView
                tabBarActiveTextColor="#ffffff"
                tabBarInactiveTextColor="#e8e8e8"
                tabBarUnderlineStyle={{ backgroundColor: '#ee0000' }}
                renderTabBar={() => <DefaultTabBar backgroundColor="#0d1949" style={{ borderBottomWidth: 0 }} />}
            >
                <View style={{ flex: 1 }} tabLabel="Missions">
                    <RecommendedCards navigation={navigation} />
                </View>
                <View style={{ flex: 1 }} tabLabel="More">
                    <MoreOptions navigation={navigation} />
                </View>
            </ScrollableTabView>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
        auth: state.firebase.auth,
        profile: state.firebase.profile,
    }
);

const mapDispatchToProps = dispatch => (
    {
        onRequestProjects: () => {
            dispatch(requestProjects());
        },
    }
);

export default ProjectNav = compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    firebaseConnect(),
)(_ProjectNav);
