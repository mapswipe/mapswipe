// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

import RecommendedCards from './RecommendedCards';
import MoreOptions from './MoreOptions';
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
} from '../constants';

/**
 * This is the base view for the project navigation, the individual tabs are rendered within here.
 */

type Props = {
    navigation: NavigationProp,
}

class _ProjectNav extends React.Component<Props> {
    componentDidMount() {
        // GLOBAL.ANALYTICS.logEvent('app_home_seen');
    }

    render() {
        const { navigation } = this.props;
        return (
            <ScrollableTabView
                tabBarActiveTextColor="#ffffff"
                tabBarInactiveTextColor={COLOR_LIGHT_GRAY}
                tabBarUnderlineStyle={{ backgroundColor: '#ee0000' }}
                renderTabBar={() => (
                    <DefaultTabBar
                        backgroundColor={COLOR_DEEP_BLUE}
                        style={{ borderBottomWidth: 0 }}
                    />
                )}
            >
                <RecommendedCards navigation={navigation} tabLabel="Missions" />
                <MoreOptions navigation={navigation} tabLabel="More" />
            </ScrollableTabView>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
        auth: state.firebase.auth,
    }
);

export default compose(
    connect(
        mapStateToProps,
    ),
    firebaseConnect(),
)(_ProjectNav);
