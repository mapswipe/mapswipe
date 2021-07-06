// @flow

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import type { NavigationProp } from '../flow-types';

type Props = {
    auth: {},
    navigation: NavigationProp,
};

class _AppLoadingScreen extends React.Component<Props> {
    componentDidMount() {
        const { auth, navigation } = this.props;
        if (isLoaded(auth)) {
            navigation.navigate(
                isEmpty(auth) ? 'LoginNavigator' : 'MainNavigator',
            );
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { auth, navigation } = this.props;
        if (auth !== prevProps.auth) {
            if (isLoaded(auth)) {
                navigation.navigate(
                    isEmpty(auth) ? 'LoginNavigator' : 'MainNavigator',
                );
            }
        }
    }

    render() {
        // we don't actually show anything, because we're always hidden behind the splashscreen
        // This screen only serves to load firebase auth and the redux store
        return null;
    }
}

const mapStateToProps = (state, ownProps) => ({
    auth: state.firebase.auth,
    navigation: ownProps.navigation,
});

const enhance = compose(firebaseConnect(), connect(mapStateToProps));

export default (enhance(_AppLoadingScreen): any);
