// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import fb from 'react-native-firebase';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

import RecommendedCards from './RecommendedCards';
import MoreOptions from './MoreOptions';
import type { NavigationProp } from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
} from '../constants';

const GLOBAL = require('../Globals');

type Props = {
    firebase: Object,
    navigation: NavigationProp,
}

class _ProjectNav extends React.Component<Props> {
    componentDidMount() {
        fb.analytics().logEvent('app_home_seen');
        const { firebase } = this.props;
        firebase.updateProfile({ lastAppUse: GLOBAL.DB.getTimestamp() });
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
