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
import { cancelGroup, commitGroup, submitFootprint } from '../../actions/index';
import Header from '../Header';
import Validator from './Validator';
import BottomProgress from '../Mapper/BottomProgress';
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
    onCancelGroup: {} => void,
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

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate = (prevProps) => {
        const { group } = this.props;
        if (prevProps.group !== group) {
            if (isLoaded(group) && !isEmpty(group)) {
                this.setState({ groupCompleted: false });
                if (this.progress) this.progress.updateProgress(0);
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
        const grp = group[Object.keys(group)[0]];
        onCancelGroup({
            groupId: grp.groupId,
            projectId: grp.projectId,
        });
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

    updateProgress = (progress: number) => {
        if (this.progress) {
            this.progress.updateProgress(progress);
        }
    }

    progress: ?BottomProgress;

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
                    updateProgress={this.updateProgress}
                />
                <BottomProgress ref={(r) => { this.progress = r; }} />
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
        onCancelGroup(groupDetails) {
            dispatch(cancelGroup(groupDetails));
        },
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
            queryParams: ['limitToLast=1', 'orderByChild=requiredCount'],
            storeAs: 'group',
        },
    ]),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(BuildingFootprintValidator);
