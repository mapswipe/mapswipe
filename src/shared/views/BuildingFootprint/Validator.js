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
    commitCompletedGroup: () => void,
    group: BuildingFootprintGroupType,
    project: ProjectType,
    submitResult: (number, string) => void,
    updateProgress: (number) => void,
};

type State = {
    currentTaskId: string,
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

    tasksDone: number;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentTaskId: this.setupTaskIdGenerator(props.group.tasks),
        };
        this.tasksDone = 0;
    }

    componentDidUpdate = (prevProps: Props) => {
        // reset the taskId generator, as it might have been initialized on another project group
        const { group } = this.props;
        if (prevProps.group.tasks !== group.tasks) {
            const currentTaskId = this.setupTaskIdGenerator(group.tasks);
            this.tasksDone = 0;
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ currentTaskId });
        }
    };

    setupTaskIdGenerator = (tasks: Array<BuildingFootprintTaskType>) => {
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
            this.taskGen = this.makeNextTaskGenerator(this.expandedTasks);
            const taskGenValue = this.taskGen.next();
            if (!taskGenValue.done) {
                return taskGenValue.value;
            }
        }
        return ''; // to keep flow and eslint happy
    };

    nextTask = (result: number) => {
        const {
            commitCompletedGroup,
            group,
            submitResult,
            updateProgress,
        } = this.props;
        const { currentTaskId } = this.state;
        submitResult(result, currentTaskId);
        const { done, value } = this.taskGen.next();
        if (done) {
            // no more tasks in the group, commit results and go back to menu
            commitCompletedGroup();
        }
        this.tasksDone += 1;
        updateProgress(this.tasksDone / group.numberOfTasks);
        this.setState({ currentTaskId: value });
    };

    // eslint-disable-next-line class-methods-use-this
    *makeNextTaskGenerator(
        tasks: Array<BuildingFootprintTaskType>,
    ): taskGenType {
        // generator function that picks the next task to work on
        // we cannot assume any specific order of taskId in the group
        const taskIds = tasks.map((t) => t.taskId);
        let i;
        // eslint-disable-next-line no-plusplus
        for (i = 0; i < taskIds.length; i++) {
            yield taskIds[i];
        }
    }

    render = () => {
        const { project } = this.props;
        const { currentTaskId } = this.state;
        if (!this.expandedTasks) {
            return <LoadingIcon />;
        }
        const currentTask = this.expandedTasks.find(
            (t) => t.taskId === currentTaskId,
        );
        if (currentTask === undefined) {
            return <LoadingIcon />;
        }
        return (
            <View>
                <FootprintDisplay project={project} task={currentTask} />
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
