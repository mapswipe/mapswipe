// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { withTranslation } from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import RNBootSplash from 'react-native-bootsplash';
import RecommendedCards from './RecommendedCards';
import UserProfile from './UserProfile';

import type { NavigationProp } from '../flow-types';
import { COLOR_DEEP_BLUE, COLOR_RED } from '../constants';
import ChangelogModal from '../common/ChangelogModal';

const GLOBAL = require('../Globals');

const renderTabBar = props => (
    <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: COLOR_RED, height: 4 }}
        style={{ backgroundColor: COLOR_DEEP_BLUE }}
    />
);

type Props = {
    firebase: Object,
    navigation: NavigationProp,
    t: string => string,
};

function ProjectNav(props: Props) {
    const { firebase, navigation, t } = props;
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        const analytics = getAnalytics(getApp());
        logEvent(analytics, 'app_home_seen');

        firebase.updateProfile({ lastAppUse: GLOBAL.DB.getTimestamp() });
        RNBootSplash.hide();
    }, []);

    const routes = React.useMemo(
        () => [
            { key: 'missions', title: t('missions') },
            { key: 'userProfile', title: t('userProfile') },
        ],
        [t],
    );

    const renderScene = React.useMemo(
        () =>
            SceneMap({
                missions: () => <RecommendedCards navigation={navigation} />,
                userProfile: () => <UserProfile navigation={navigation} />,
            }),
        [navigation],
    );

    return (
        <>
            <ChangelogModal />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
            />
        </>
    );
}

const mapStateToProps = (state, ownProps) => ({
    navigation: ownProps.navigation,
    auth: state.firebase.auth,
});

export default (compose(
    withTranslation('mainHeader'),
    connect(mapStateToProps),
    firebaseConnect(),
)(ProjectNav): any);
