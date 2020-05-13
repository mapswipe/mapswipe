// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import fb from 'react-native-firebase';
import { firebaseConnect } from 'react-redux-firebase';
import { StyleSheet, Text, View } from 'react-native';
import Button from 'apsl-react-native-button';
import { MessageBarManager } from 'react-native-message-bar';
import { commitGroup, type GroupInfo } from '../actions/index';
import type { GroupType, NavigationProp, ResultMapType } from '../flow-types';
import { COLOR_DARK_GRAY, COLOR_DEEP_BLUE, COLOR_WHITE } from '../constants';

const GLOBAL = require('../Globals');

const styles = StyleSheet.create({
    congratulationsSlide: {
        width: GLOBAL.SCREEN_WIDTH,
        height: '100%',
        borderWidth: 0,
        backgroundColor: COLOR_DARK_GRAY,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    moreButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        marginTop: 20,
        width: '70%',
        marginLeft: '15%',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    finishedText: {
        textAlign: 'center',
        color: COLOR_WHITE,
        marginBottom: 10,
        width: '70%',
    },
});

type Props = {
    group: GroupType,
    navigation: NavigationProp,
    onCommitGroup: (GroupInfo) => void,
    projectId: string,
    results: ResultMapType,
    toNextGroup: (void) => void,
    tutorial: boolean,
};

class _LoadMoreCard extends React.Component<Props> {
    showSyncResult = (data, alertType) => {
        MessageBarManager.showAlert({
            title: `${data.successCount} tasks synced`,
            message: `${data.errorCount} failures`,
            alertType,
        });
    };

    showSyncProgress = () => {
        MessageBarManager.showAlert({
            title: 'Sync Alert',
            message: 'Syncing your tasks.. do not close',
            alertType: 'info',
        });
    };

    commitCompletedGroup = () => {
        // user completed the group: let's commit it to firebase
        const { group, onCommitGroup, projectId, results } = this.props;
        // do not upload results for tutorial groups
        if (!projectId.includes('tutorial')) {
            fb.analytics().logEvent('complete_group');
            onCommitGroup({
                groupId: group.groupId,
                projectId,
                results,
            });
        } else {
            fb.analytics().logEvent('finish_tutorial');
        }
    };

    onMore = () => {
        const { toNextGroup } = this.props;
        this.showSyncProgress();
        this.commitCompletedGroup();
        toNextGroup();
    };

    onComplete = () => {
        const { navigation } = this.props;
        this.showSyncProgress();
        this.commitCompletedGroup();
        navigation.pop();
    };

    _onBack = () => {
        const { navigation } = this.props;
        navigation.pop();
    };

    render() {
        const { tutorial } = this.props;
        return (
            <View style={styles.congratulationsSlide}>
                <Text style={styles.finishedText}>
                    {tutorial
                        ? 'Good. You have completed the tutorial. You are ready to do some mapping!'
                        : 'Great job! You finished this group.'}
                </Text>

                <Button
                    style={styles.moreButton}
                    onPress={this.onComplete}
                    textStyle={{ fontSize: 18, color: COLOR_WHITE }}
                >
                    {tutorial ? "Let's go!" : 'Complete Session'}
                </Button>
                {tutorial || (
                    <Button
                        style={styles.moreButton}
                        onPress={this.onMore}
                        textStyle={{ fontSize: 18, color: COLOR_WHITE }}
                    >
                        Continue mapping
                    </Button>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    navigation: ownProps.navigation,
    results: state.results,
});

const mapDispatchToProps = (dispatch) => ({
    onCommitGroup(groupInfo) {
        dispatch(commitGroup(groupInfo));
    },
});

export default compose(
    firebaseConnect(),
    connect(mapStateToProps, mapDispatchToProps),
)(_LoadMoreCard);
