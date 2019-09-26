// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from 'apsl-react-native-button';
import { MessageBarManager } from 'react-native-message-bar';
import { commitGroup, type GroupInfo } from '../actions/index';
import type { GroupType, NavigationProp, ResultMapType } from '../flow-types';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_WHITE,
} from '../constants';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    congratulationsSlide: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: (GLOBAL.TILE_VIEW_HEIGHT),
        borderWidth: 0,
        backgroundColor: COLOR_DARK_GRAY,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    moreButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        marginTop: 20,
        width: (GLOBAL.SCREEN_WIDTH * (1 / 2)),
        marginLeft: (GLOBAL.SCREEN_WIDTH * (1 / 4)),
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    finishedText: {
        textAlign: 'center',
        color: COLOR_WHITE,
    },
});

type Props = {
    getContributions: (GroupType, ResultMapType) => Object,
    group: GroupType,
    navigation: NavigationProp,
    onCommitGroup: GroupInfo => void,
    projectId: string,
    results: ResultMapType,
    toNextGroup: void => void,
};

class _LoadMoreCard extends React.Component<Props> {
    showSyncResult = (data, alertType) => {
        MessageBarManager.showAlert({
            title: `${data.successCount} tasks synced`,
            message: `${data.errorCount} failures`,
            alertType,
        });
    }

    showSyncProgress = () => {
        MessageBarManager.showAlert({
            title: 'Sync Alert',
            message: 'Syncing your tasks.. do not close',
            alertType: 'info',
        });
    }

    commitCompletedGroup = () => {
        // user completed the group: let's commit it to firebase
        const {
            getContributions,
            group,
            onCommitGroup,
            projectId,
            results,
        } = this.props;
        const { contributionsCount, addedDistance } = getContributions(group, results);
        // do not upload results for tutorial groups
        if (!projectId.includes('tutorial')) {
            onCommitGroup({
                addedDistance,
                groupId: group.groupId,
                projectId,
                contributionsCount,
                results,
            });
        }
    }

    onMore = () => {
        const { toNextGroup } = this.props;
        // GLOBAL.ANALYTICS.logEvent('complete_group');
        this.showSyncProgress();
        this.commitCompletedGroup();
        toNextGroup();
    }

    onComplete = () => {
        // GLOBAL.ANALYTICS.logEvent('complete_group');
        const { navigation } = this.props;
        this.showSyncProgress();
        this.commitCompletedGroup();
        navigation.pop();
    }

    _onBack = () => {
        const { navigation } = this.props;
        navigation.pop();
    }

    render() {
        return (
            <View style={styles.congratulationsSlide}>
                <Text style={styles.finishedText}>
Great job! You finished this group.
                    {' '}
                </Text>

                <Button
                    style={styles.moreButton}
                    onPress={this.onComplete}
                    textStyle={{ fontSize: 18, color: COLOR_WHITE }}
                >
                    Complete Session
                </Button>
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
        results: state.results,
    }
);

const mapDispatchToProps = dispatch => (
    {
        onCommitGroup(groupInfo) {
            dispatch(commitGroup(groupInfo));
        },
    }
);

export default compose(
    firebaseConnect(),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(_LoadMoreCard);
