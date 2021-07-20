// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import fb from '@react-native-firebase/app';
import { withTranslation } from 'react-i18next';
import RNBootSplash from 'react-native-bootsplash';
import RecommendedCards from './RecommendedCards';
import MoreOptions from './MoreOptions';
import ScrollableTabView from '../common/ScrollableTabView/ScrollableTabView';
import DefaultTabBar from '../common/ScrollableTabView/DefaultTabBar';
import type { NavigationProp } from '../flow-types';
import { COLOR_DEEP_BLUE, COLOR_LIGHT_GRAY, COLOR_RED } from '../constants';

const GLOBAL = require('../Globals');

type Props = {
    firebase: Object,
    navigation: NavigationProp,
    t: string => string,
};

class _ProjectNav extends React.Component<Props> {
    componentDidMount() {
        fb.analytics().logEvent('app_home_seen');
        const { firebase } = this.props;
        firebase.updateProfile({ lastAppUse: GLOBAL.DB.getTimestamp() });
        RNBootSplash.hide();
    }

    render() {
        const { firebase, navigation, t } = this.props;
        console.log('watchers', firebase._);
        return (
            <ScrollableTabView
                tabBarActiveTextColor="#ffffff"
                tabBarInactiveTextColor={COLOR_LIGHT_GRAY}
                renderTabBar={() => (
                    <DefaultTabBar
                        backgroundColor={COLOR_DEEP_BLUE}
                        style={{ borderBottomWidth: 0 }}
                        tabBarUnderlineStyle={{ backgroundColor: COLOR_RED }}
                    />
                )}
            >
                <RecommendedCards
                    navigation={navigation}
                    tabLabel={t('missions')}
                />
                <MoreOptions navigation={navigation} tabLabel={t('more')} />
            </ScrollableTabView>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    navigation: ownProps.navigation,
    auth: state.firebase.auth,
});

export default (compose(
    withTranslation('mainHeader'),
    connect(mapStateToProps),
    firebaseConnect(),
)(_ProjectNav): any);
