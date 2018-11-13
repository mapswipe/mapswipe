// @flow
import * as React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from 'apsl-react-native-button';
import { MessageBarManager } from 'react-native-message-bar';

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

export default class LoadMoreCard extends React.Component {

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

    _onMore = () => {
        const { groupInfo, mapper } = this.props;
        // GLOBAL.ANALYTICS.logEvent('complete_group');
        console.log('made it to more');
        this.showSyncProgress();
        GLOBAL.DB.addGroupComplete(groupInfo.project, groupInfo.group).then((data) => {
            console.log('did group complete');
            mapper.cardbody.resetState();
            GLOBAL.DB.getSingleGroup(groupInfo.project).then((data) => {
                console.log('got new one');
                mapper.cardbody.generateCards(data.group);
            }).catch((error) => {
                console.error(error);
            });

            console.log('Completed group report');
            GLOBAL.DB.syncAndDeIndex().then((data) => {
                this.showSyncResult(data, 'success');
            }).catch((error) => {
                this.showSyncResult(data, 'error');
            });
        });
    }

    _onComplete = () => {
        // GLOBAL.ANALYTICS.logEvent('complete_group');
        const { mapper } = this.props;
        this.showSyncProgress();
        console.log('completing', this.props.groupInfo);
        GLOBAL.DB.addGroupComplete(this.props.groupInfo.project, this.props.groupInfo.group).then((data) => {
            mapper.cardbody.resetState();
            console.log('Completed group report');
            GLOBAL.DB.syncAndDeIndex().then((data) => {
                this.showSyncResult(data, 'success');
                mapper.props.navigation.pop();
            }).catch((error) => {
                this.showSyncResult(data, 'error');
                mapper.props.navigation.pop();
            });
        });
    }

    _onBack = () => {
        const { mapper } = this.props;
        mapper.cardbody.resetState();
        mapper.props.navigation.pop();
        // save the current tasks but don't add a completeCount
        // mapper.props.navigation.push({id:1, data: mapper.props.data});
    }

    render() {
        return (
            <View style={styles.congratulationsSlide}>
                <Text style={styles.finishedText}>
Great job! You finished this group. Do you want to continue to map more in
                this project?
                    {' '}
                </Text>

                <Button style={styles.moreButton} onPress={this._onMore} textStyle={{ fontSize: 18, color: '#ffffff' }}>
Map
                further
                </Button>
                <Button style={styles.moreButton} onPress={this._onComplete} textStyle={{ fontSize: 18, color: '#ffffff' }}>
Complete
                Session
                </Button>
            </View>
        );
    }
}


