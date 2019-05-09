// @flow
import * as React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { commitGroup, submitFootprint } from '../../actions/index';
import Header from '../Header';
import Validator from './Validator';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import { getSqKmForZoomLevelPerTile } from '../../Database';
import type {
    GroupMapType,
    GroupType,
    NavigationProp,
    ProjectType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

/* eslint-disable global-require */

const styles = StyleSheet.create({
    mappingContainer: {
        backgroundColor: '#0d1949',
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
    },
});

type Props = {
    group: GroupMapType,
    navigation: NavigationProp,
    onSubmitFootprint: (Object) => void,
};

type State = {
    groupCompleted: bool,
};

class BuildingFootprintValidator extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.project = props.navigation.getParam('project');
        this.state = {
            groupCompleted: false,
        };
    }

    componentDidUpdate = (prevProps) => {
        const { group } = this.props;
        if (prevProps.group !== group) {
            if (isLoaded(group) && !isEmpty(group)) {
                this.setState({ groupCompleted: false });
            }
        }
    }

    returnToView = () => {
        const { navigation } = this.props;
        navigation.pop();
    }

    submitFootprintResult = (result, taskId) => {
        const { group, onSubmitFootprint } = this.props;
        const resultObject = {
            resultId: taskId,
            result,
            groupId: group[Object.keys(group)[0]].groupId,
            projectId: this.project.projectId,
            timestamp: GLOBAL.DB.getTimestamp(),
        };
        onSubmitFootprint(resultObject);
    }

    commitCompletedGroup = () => {
        this.setState({ groupCompleted: true });
    }

    getContributions = (group, results) => {
        const contributionsCount = Object.keys(results).length;
        const addedDistance = group.count * getSqKmForZoomLevelPerTile(19);
        return { contributionsCount, addedDistance };
    }

    toNextGroup = () => {
        const { navigation } = this.props;
        navigation.navigate('BuildingFootprintValidator', { project: this.project });
    }

    project: ProjectType;

    render = () => {
        const { group, navigation } = this.props;
        const { groupCompleted } = this.state;
        if (!group) {
            return <LoadingIcon />;
        }
        const groupData : GroupType = group[Object.keys(group)[0]];
        if (groupCompleted) {
            return (
                <LoadMoreCard
                    getContributions={this.getContributions}
                    group={groupData}
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
                <Validator
                    commitCompletedGroup={this.commitCompletedGroup}
                    group={groupData}
                    project={this.project}
                    submitFootprintResult={this.submitFootprintResult}
                />
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        group: state.firebase.data.group,
        navigation: ownProps.navigation,
        results: state.results,
    }
);

const mapDispatchToProps = dispatch => (
    {
        onCommitGroup(groupInfo) {
            dispatch(commitGroup(groupInfo));
        },
        onSubmitFootprint(resultObject) {
            dispatch(submitFootprint(resultObject));
        },
    }
);

export default compose(
    firebaseConnect(props => [
        {
            path: `groups/${props.navigation.getParam('project').projectId}`,
            queryParams: ['limitToFirst=1', 'orderByChild=completedCount'],
            storeAs: 'group',
        },
    ]),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(BuildingFootprintValidator);
