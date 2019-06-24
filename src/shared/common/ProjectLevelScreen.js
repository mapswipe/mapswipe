// @flow
import * as React from 'react';
import {
    BackHandler,
    StyleSheet,
    View,
} from 'react-native';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { get } from 'lodash';
import {
    cancelGroup,
    commitGroup,
    startGroup,
} from '../actions/index';
import Header from '../views/Header';
import BottomProgress from '../views/Mapper/BottomProgress';
import LoadingIcon from '../views/LoadingIcon';
import LoadMoreCard from '../views/LoadMore';
import { getSqKmForZoomLevelPerTile } from '../Database';
import type {
    GroupType,
    NavigationProp,
    ProjectType,
    ResultMapType,
} from '../flow-types';
import {
    COLOR_DEEP_BLUE,
} from '../constants';

const GLOBAL = require('../Globals');

/* eslint-disable global-require */

const styles = StyleSheet.create({
    mappingContainer: {
        backgroundColor: COLOR_DEEP_BLUE,
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
    },
});

type Props = {
    Component: React.ComponentType<any>,
    group: { [group_id: string]: GroupType },
    navigation: NavigationProp,
    onCancelGroup: {} => void,
    onStartGroup: {} => void,
    onSubmitResult: (Object) => void,
    screenName: string,
};

type State = {
    groupCompleted: bool,
};

class ProjectLevelScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.project = props.navigation.getParam('project');
        this.state = {
            groupCompleted: false,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate = (prevProps) => {
        const { group, onStartGroup } = this.props;
        if (prevProps.group !== group) {
            if (isLoaded(group) && !isEmpty(group)) {
                // the component props are updated when group is received
                // and then when tasks are received
                if (group.tasks !== undefined) {
                    onStartGroup({
                        groupId: group.groupId,
                        projectId: group.projectId,
                        timestamp: GLOBAL.DB.getTimestamp(),
                    });
                    this.setState({ groupCompleted: false });
                    if (this.progress) this.progress.updateProgress(0);
                }
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.returnToView();
        return true;
    }

    returnToView = () => {
        const { group, navigation, onCancelGroup } = this.props;
        // TODO: this will not work with offline preloading of multiple groups
        // as several groups will be stored in redux, possibly with clashing groupId
        onCancelGroup({
            groupId: group.groupId,
            projectId: group.projectId,
        });
        navigation.pop();
    }

    submitResult = (result: number, taskId) => {
        const { group, onSubmitResult } = this.props;
        const resultObject = {
            resultId: taskId,
            result,
            groupId: group.groupId,
            projectId: this.project.projectId,
            timestamp: GLOBAL.DB.getTimestamp(),
        };
        onSubmitResult(resultObject);
    }

    commitCompletedGroup = () => {
        this.setState({ groupCompleted: true });
    }

    getContributions = (group: GroupType, results: ResultMapType) => {
        const contributionsCount = Object.keys(results).length;
        const addedDistance = group.numberOfTasks * getSqKmForZoomLevelPerTile(19);
        return { contributionsCount, addedDistance };
    }

    toNextGroup = () => {
        const { navigation, screenName } = this.props;
        navigation.navigate(screenName, { project: this.project });
    }

    updateProgress = (progress: number) => {
        if (this.progress) {
            this.progress.updateProgress(progress);
        }
    }

    progress: ?BottomProgress;

    project: ProjectType;

    render = () => {
        const { Component, group, navigation } = this.props;
        const { groupCompleted } = this.state;
        if (!group) {
            return <LoadingIcon />;
        }
        if (groupCompleted) {
            return (
                <LoadMoreCard
                    getContributions={this.getContributions}
                    group={group}
                    navigation={navigation}
                    projectId={this.project.projectId}
                    toNextGroup={this.toNextGroup}
                />
            );
        }
        return (
            <View style={styles.mappingContainer}>
                <Header
                    lookFor={this.project.lookFor}
                    onBackPress={this.returnToView}
                />
                <Component
                    commitCompletedGroup={this.commitCompletedGroup}
                    group={group}
                    project={this.project}
                    submitFootprintResult={this.submitResult}
                    updateProgress={this.updateProgress}
                />
                <BottomProgress ref={(r) => { this.progress = r; }} />
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    // if we're offline, there might be more than 1 group in the local
    // firebase data, for now, we just pick the first one
    const { projectId } = ownProps.navigation.getParam('project', null);
    let groupId = '';
    const { groups } = state.firebase.data.projects[projectId];
    if (isLoaded(groups)) {
        // eslint-disable-next-line prefer-destructuring
        groupId = Object.keys(groups)[0];
    }
    return {
        group: get(state.firebase.data, `projects.${projectId}.groups.${groupId}`),
        navigation: ownProps.navigation,
        results: state.results,
    };
};

const mapDispatchToProps = (dispatch, ownProps) => (
    {
        onCancelGroup(groupDetails) {
            dispatch(cancelGroup(groupDetails));
        },
        onCommitGroup(groupInfo) {
            dispatch(commitGroup(groupInfo));
        },
        onStartGroup(groupDetails) {
            dispatch(startGroup(groupDetails));
        },
        onSubmitResult(resultObject) {
            dispatch(ownProps.submitResultFunction(resultObject));
        },
    }
);

export default compose(
    firebaseConnect((props) => {
        const { projectId } = props.navigation.getParam('project', null);
        if (projectId) {
            return [
                {
                    type: 'once',
                    path: `groups/${projectId}`,
                    queryParams: ['limitToLast=1', 'orderByChild=requiredCount'],
                    storeAs: `projects/${projectId}/groups`,
                },
            ];
        }
        return [];
    }),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(ProjectLevelScreen);
