// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import pako from 'pako';
import base64 from 'base-64';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { StyleSheet, View } from 'react-native';
import Button from 'apsl-react-native-button';
import FootprintDisplay from './FootprintDisplay';
import LoadingIcon from '../LoadingIcon';
import { COLOR_GREEN, COLOR_RED, COLOR_YELLOW } from '../../constants';

import type {
    BuildingFootprintGroupType,
    ProjectType,
    BuildingFootprintTaskType,
} from '../../flow-types';

const styles = StyleSheet.create({
    button: {
        borderRadius: 0,
        height: 55,
        marginBottom: 0,
        marginTop: 5,
    },
});

const FOOTPRINT_CORRECT = 1;
const FOOTPRINT_NEEDS_ADJUSTMENT = 2;
const FOOTPRINT_NO_BUILDING = 3;

type Props = {
    completeGroup: () => void,
    group: BuildingFootprintGroupType,
    project: ProjectType,
    submitResult: (number, string) => void,
    updateProgress: (number) => void,
};

type State = {
    // the index of the current task in the task array
    currentTaskIndex: number,
    // currentTaskId: string,
};

// see https://zhenyong.github.io/flowtype/blog/2015/11/09/Generators.html
type taskGenType = Generator<string, void, void>;

class _Validator extends React.Component<Props, State> {
    // props.group.tasks are now gzipped and base64 encoded on the server
    // so we need to decode and gunzip them into a JSON string which is then
    // parsed into an array. for this project type, we do not load the tasks
    // directly, instead we do the above process and then work with the result
    // which is stored in expandedTasks
    expandedTasks: Array<BuildingFootprintTaskType>;

    taskGen: taskGenType;

    // keep track of how far the user has actually provided results
    // so we can disable the swipe forward option, to prevent swiping
    // past tasks they haven't provided an answer for yet
    tasksDone: number;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentTaskIndex: 0,
        };
        this.tasksDone = 0;
        this.setupTasksList(props.group.tasks);
    }

    componentDidUpdate = (prevProps: Props) => {
        // reset the taskId generator, as it might have been initialized on another project group
        const { group } = this.props;
        if (prevProps.group.tasks !== group.tasks) {
            this.setupTasksList(group.tasks);
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ currentTaskIndex: 0 });
        }
    };

    setupTasksList = (tasks: Array<BuildingFootprintTaskType>) => {
        if (isLoaded(tasks) && !isEmpty(tasks)) {
            // TODO: is it possible that tasks are only partially loaded
            // when we get here? if so, we should bail out politely in case
            // of error

            // decode base64 and gunzip tasks
            const compressedTasks = base64.decode(tasks);
            const expandedTasks = pako.inflate(compressedTasks, {
                to: 'string',
            });
            this.expandedTasks = JSON.parse(expandedTasks);
        }
        return ''; // to keep flow and eslint happy
    };

    nextTask = (result: ?number) => {
        const {
            completeGroup,
            group,
            submitResult,
            updateProgress,
        } = this.props;
        const { currentTaskIndex } = this.state;
        if (result) {
            submitResult(result, this.expandedTasks[currentTaskIndex].taskId);
            this.tasksDone = currentTaskIndex;
        } else if (currentTaskIndex > this.tasksDone) {
            // no result provided, the user just tried to swipe forward
            // past the last task completed, just ignore this swipe
            // TODO: provide some visual feedback
            return;
        }
        if (currentTaskIndex + 1 >= this.expandedTasks.length) {
            // no more tasks in the group, show the "LoadMore" screen
            completeGroup();
            return;
        }
        updateProgress(currentTaskIndex / group.numberOfTasks);
        this.setState({ currentTaskIndex: currentTaskIndex + 1 });
    };

    previousTask = () => {
        const { group, updateProgress } = this.props;
        const { currentTaskIndex } = this.state;
        if (currentTaskIndex > 0) {
            updateProgress(currentTaskIndex / group.numberOfTasks);
            this.setState({ currentTaskIndex: currentTaskIndex - 1 });
        }
    };

    render = () => {
        const { project } = this.props;
        const { currentTaskIndex } = this.state;
        if (!this.expandedTasks) {
            return <LoadingIcon />;
        }
        const currentTask = this.expandedTasks[currentTaskIndex];
        if (currentTask === undefined) {
            return <LoadingIcon />;
        }
        return (
            <View>
                <FootprintDisplay
                    nextTask={this.nextTask}
                    previousTask={this.previousTask}
                    project={project}
                    task={currentTask}
                />
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_CORRECT)}
                    style={[{ backgroundColor: COLOR_GREEN }, styles.button]}
                >
                    Looks good
                </Button>
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_NEEDS_ADJUSTMENT)}
                    style={[{ backgroundColor: COLOR_YELLOW }, styles.button]}
                >
                    Needs adjustment
                </Button>
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_NO_BUILDING)}
                    style={[{ backgroundColor: COLOR_RED }, styles.button]}
                >
                    No building
                </Button>
            </View>
        );
    };
}

const mapStateToProps = (state, ownProps) => ({
    commitCompletedGroup: ownProps.commitCompletedGroup,
    group: ownProps.group,
    project: ownProps.project,
    submitResult: ownProps.submitResult,
});

export default compose(
    firebaseConnect((props) => {
        if (props.group) {
            const { groupId } = props.group;
            const { projectId } = props.project;
            if (groupId !== undefined) {
                return [
                    {
                        type: 'once',
                        path: `v2/tasks/${projectId}/${groupId}`,
                        storeAs: `projects/${projectId}/groups/${groupId}/tasks`,
                    },
                ];
            }
        }
        return [];
    }),
    connect(mapStateToProps),
)(_Validator);
