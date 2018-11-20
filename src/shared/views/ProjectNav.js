import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    View,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

import { requestProjects } from '../actions/index';
import { RecommendedCards } from './RecommendedCards';
import { MoreOptions } from './MoreOptions';

const GLOBAL = require('../Globals');

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
