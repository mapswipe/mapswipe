import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    View,
} from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

import { RecommendedCards } from './RecommendedCards';
import { MoreOptions } from './MoreOptions';

/**
 * This is the base view for the project navigation, the individual tabs are rendered within here.
 */

class _ProjectNav extends React.Component {
    componentDidMount() {
        // GLOBAL.ANALYTICS.logEvent('app_home_seen');
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

export default compose(
    connect(
        mapStateToProps,
    ),
    firebaseConnect(),
)(_ProjectNav);
