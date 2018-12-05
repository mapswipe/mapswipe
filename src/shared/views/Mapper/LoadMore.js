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
import { commitGroup } from '../../actions/index';
import { getSqKmForZoomLevelPerTile } from '../../Database';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    congratulationsSlide: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT),
        borderWidth: 0,
        backgroundColor: '#212121',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    moreButton: {
        backgroundColor: '#0d1949',
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
        color: '#ffffff',
    },
});

class _LoadMoreCard extends React.Component {

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
            group,
            groupId,
            onCommitGroup,
            projectId,
            results,
        } = this.props;
        const contributionsCount = Object.keys(results).length;
        const addedDistance = group.count * getSqKmForZoomLevelPerTile(group.zoomLevel);
        onCommitGroup({
            addedDistance,
            groupId,
            projectId,
            contributionsCount,
            tasks: results,
            zoomLevel: group.zoomLevel,
        });
    }

    onMore = () => {
        const { groupInfo, navigation } = this.props;
        // GLOBAL.ANALYTICS.logEvent('complete_group');
        this.showSyncProgress();
        this.commitCompletedGroup();
        navigation.navigate('Mapper');
    }

    onComplete = () => {
        // GLOBAL.ANALYTICS.logEvent('complete_group');
        const { navigation } = this.props;
        this.showSyncProgress();
        this.commitCompletedGroup();
        navigation.pop();
    }

    _onBack = () => {
        const { mapper } = this.props;
        mapper.props.navigation.pop();
    }

    render() {
        return (
            <View style={styles.congratulationsSlide}>
                <Text style={styles.finishedText}>
Great job! You finished this group. Do you want to continue to map more in
                this project?
                    {' '}
                </Text>

                <Button
                    style={styles.moreButton}
                    onPress={this.onMore}
                    textStyle={{ fontSize: 18, color: '#ffffff' }}
                >
                    Map further
                </Button>
                <Button
                    style={styles.moreButton}
                    onPress={this.onComplete}
                    textStyle={{ fontSize: 18, color: '#ffffff' }}
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
