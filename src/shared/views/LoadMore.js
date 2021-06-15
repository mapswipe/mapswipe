// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import fb from '@react-native-firebase/app';
import { firebaseConnect } from 'react-redux-firebase';
import { StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import Button from 'apsl-react-native-button';
import { MessageBarManager } from 'react-native-message-bar';
import { cancelGroup, commitGroup, type GroupInfo } from '../actions/index';
import type {
    GroupType,
    NavigationProp,
    ResultMapType,
    TranslationFunction,
} from '../flow-types';
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
    onCancelGroup: ({}) => void,
    onCommitGroup: GroupInfo => void,
    projectId: string,
    results: ResultMapType,
    t: TranslationFunction,
    toNextGroup: void => void,
    tutorial: boolean,
};

class _LoadMoreCard extends React.Component<Props> {
    // the screen shown at the end of a group when mapping.
    // This should not be used for tutorials after the upgrade of late 2020
    // and you should use TutorialEndScreen instead
    // TODO: remove all the code related to tutorial mode once this screen
    // is not used for any project type tutorial anymore
    showSyncProgress = () => {
        const { t } = this.props;
        MessageBarManager.showAlert({
            title: t('sync alert'),
            message: t('sync alert message'),
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
        }
    };

    onMore = () => {
        // handle "continue mapping" button press
        // this should never be called in tutorial mode
        // as the button is not visible
        const { toNextGroup } = this.props;
        this.showSyncProgress();
        this.commitCompletedGroup();
        toNextGroup();
    };

    onComplete = () => {
        const { group, navigation, onCancelGroup, tutorial } = this.props;
        if (tutorial) {
            fb.analytics().logEvent('finish_tutorial');
            // this prevents the tutorial from showing
            // results from a previous run
            onCancelGroup({
                groupId: group.groupId,
                projectId: group.projectId,
            });
        } else {
            // in tutorial mode, we don't need to save anything
            this.showSyncProgress();
            this.commitCompletedGroup();
        }
        navigation.pop();
    };

    _onBack = () => {
        const { navigation } = this.props;
        navigation.pop();
    };

    render() {
        const { t, tutorial } = this.props;
        return (
            <View style={styles.congratulationsSlide}>
                <Text style={styles.finishedText}>
                    {tutorial ? t('completedTutorial') : t('finishedGroup')}
                </Text>

                <Button
                    style={styles.moreButton}
                    onPress={this.onComplete}
                    textStyle={{ fontSize: 18, color: COLOR_WHITE }}
                >
                    {tutorial ? t('letsGo') : t('completeSession')}
                </Button>
                {tutorial || (
                    <Button
                        style={styles.moreButton}
                        onPress={this.onMore}
                        textStyle={{ fontSize: 18, color: COLOR_WHITE }}
                    >
                        {t('continueMapping')}
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

const mapDispatchToProps = dispatch => ({
    onCancelGroup(groupDetails) {
        dispatch(cancelGroup(groupDetails));
    },
    onCommitGroup(groupInfo) {
        dispatch(commitGroup(groupInfo));
    },
});

export default (compose(
    withTranslation('loadMoreScreen'),
    firebaseConnect(),
    connect(mapStateToProps, mapDispatchToProps),
)(_LoadMoreCard): any);
