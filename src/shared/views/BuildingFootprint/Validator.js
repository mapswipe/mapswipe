// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import get from 'lodash.get';
import pako from 'pako';
import base64 from 'base-64';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { Image, StyleSheet, Text, View } from 'react-native';
import Button from 'apsl-react-native-button';
import FootprintDisplay from './FootprintDisplay';
import LoadingIcon from '../LoadingIcon';
import { COLOR_WHITE } from '../../constants';
import GLOBAL from '../../Globals';

import type {
    BuildingFootprintGroupType,
    BuildingFootprintTaskType,
    ResultMapType,
    SingleImageryProjectType,
} from '../../flow-types';

// in order to allow enough screen height for satellite imagery on small
// screens (less than 550px high) we make buttons smaller on those screens
const buttonHeight = GLOBAL.SCREEN_HEIGHT >= 550 ? 50 : 40;
const buttonMargin = GLOBAL.SCREEN_HEIGHT >= 550 ? 5 : 3;

const buttonBGColor = 'rgba(255, 255, 255, 0.2)';
const buttonBGColorSelected = 'rgba(255, 255, 255, 0.8)';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    checkmark: {
        alignSelf: 'center',
        marginBottom: -3,
        height: 25,
        width: 25,
    },
    sideBySideButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bigSquareButton: {
        borderColor: COLOR_WHITE,
        borderRadius: 20,
        borderWidth: 2,
        height: buttonHeight * 2,
        flex: 1,
        marginBottom: buttonMargin,
        marginLeft: buttonMargin,
        marginRight: buttonMargin,
        marginTop: buttonMargin,
    },
    bigSquareButtonText: {
        alignSelf: 'center',
        color: COLOR_WHITE,
        fontSize: 18,
        fontWeight: 'bold',
    },
    longNarrowButton: {
        borderColor: COLOR_WHITE,
        borderRadius: 20,
        borderWidth: 2,
        color: COLOR_WHITE,
        height: buttonHeight,
        marginBottom: buttonMargin,
        marginLeft: buttonMargin,
        marginRight: buttonMargin,
        marginTop: buttonMargin,
    },
    longNarrowButtonText: {
        color: COLOR_WHITE,
        fontWeight: 'bold',
    },
});

const FOOTPRINT_NO_BUILDING = 0;
const FOOTPRINT_BUILDING = 1;
const FOOTPRINT_NOT_SURE = 2;
const FOOTPRINT_BAD_IMAGERY = 3;

type Props = {
    completeGroup: () => void,
    group: BuildingFootprintGroupType,
    project: SingleImageryProjectType,
    results: ResultMapType,
    submitResult: (number, string) => void,
    updateProgress: (number) => void,
};

type State = {
    // the index of the current task in the task array
    currentTaskIndex: number,
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

    nextTask = (result: ?number): boolean => {
        // update state to point to the next task in the list, and
        // save result if one was provided.
        // Return a bool indicating whether we've reached the end of
        // the array of tasks
        const {
            completeGroup,
            group,
            submitResult,
            updateProgress,
        } = this.props;
        const { currentTaskIndex } = this.state;
        if (result !== null && result !== undefined) {
            // the user tapped a button, save result and update how far
            // we've worked
            submitResult(result, this.expandedTasks[currentTaskIndex].taskId);
            if (currentTaskIndex > this.tasksDone) {
                this.tasksDone = currentTaskIndex;
            }
        } else if (currentTaskIndex > this.tasksDone) {
            // no result provided, the user just tried to swipe forward
            // past the last task completed, just ignore this swipe
            // but return true to indicate we can't go any further
            return true;
        }
        if (currentTaskIndex + 1 >= this.expandedTasks.length) {
            // no more tasks in the group, show the "LoadMore" screen
            completeGroup();
            return false;
        }
        updateProgress(currentTaskIndex / group.numberOfTasks);
        this.setState({ currentTaskIndex: currentTaskIndex + 1 });
        return false;
    };

    previousTask = (): boolean => {
        // update state to point to the previous task and return a
        // bool indicating whether we've reached the end of the array of tasks
        const { group, updateProgress } = this.props;
        const { currentTaskIndex } = this.state;
        if (currentTaskIndex > 0) {
            updateProgress(currentTaskIndex / group.numberOfTasks);
            this.setState({ currentTaskIndex: currentTaskIndex - 1 });
            return false;
        }
        return true;
    };

    /* eslint-disable global-require */
    render = () => {
        const { project, results } = this.props;
        const { currentTaskIndex } = this.state;
        if (!this.expandedTasks) {
            return <LoadingIcon />;
        }
        const currentTask = this.expandedTasks[currentTaskIndex];
        // if tasks have a center attribute, we know they're grouped by 9
        // so we look a bit further ahead to prefetch imagery
        const prefetchOffset = currentTask.center ? 9 : 1;
        const prefetchTask = this.expandedTasks[
            currentTaskIndex + prefetchOffset
        ];
        if (currentTask === undefined) {
            return <LoadingIcon />;
        }
        let selectedResult;
        if (results) {
            selectedResult = results[currentTask.taskId];
        }
        return (
            <View style={styles.container}>
                <FootprintDisplay
                    nextTask={this.nextTask}
                    prefetchTask={prefetchTask}
                    previousTask={this.previousTask}
                    project={project}
                    task={currentTask}
                />
                <View style={styles.sideBySideButtons}>
                    <Button
                        onPress={() => this.nextTask(FOOTPRINT_BUILDING)}
                        style={[
                            {
                                backgroundColor:
                                    selectedResult === FOOTPRINT_BUILDING
                                        ? buttonBGColorSelected
                                        : buttonBGColor,
                            },
                            styles.bigSquareButton,
                        ]}
                        textStyle={styles.bigSquareButtonText}
                    >
                        <View>
                            <Image
                                source={require('../assets/checkmark_white.png')}
                                style={styles.checkmark}
                            />
                            <Text style={styles.bigSquareButtonText}>Yes</Text>
                        </View>
                    </Button>
                    <Button
                        onPress={() => this.nextTask(FOOTPRINT_NO_BUILDING)}
                        style={[
                            {
                                backgroundColor:
                                    selectedResult === FOOTPRINT_NO_BUILDING
                                        ? buttonBGColorSelected
                                        : buttonBGColor,
                            },
                            styles.bigSquareButton,
                        ]}
                        textStyle={styles.bigSquareButtonText}
                    >
                        {`\u2715\nNo`}
                    </Button>
                </View>
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_NOT_SURE)}
                    style={[
                        {
                            backgroundColor:
                                selectedResult === FOOTPRINT_NOT_SURE
                                    ? buttonBGColorSelected
                                    : buttonBGColor,
                        },
                        styles.longNarrowButton,
                    ]}
                    textStyle={styles.longNarrowButtonText}
                >
                    Not sure
                </Button>
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_BAD_IMAGERY)}
                    style={[
                        {
                            backgroundColor:
                                selectedResult === FOOTPRINT_BAD_IMAGERY
                                    ? buttonBGColorSelected
                                    : buttonBGColor,
                        },
                        styles.longNarrowButton,
                    ]}
                    textStyle={styles.longNarrowButtonText}
                >
                    Bad imagery
                </Button>
            </View>
        );
    };
}

const mapStateToProps = (state, ownProps) => ({
    commitCompletedGroup: ownProps.commitCompletedGroup,
    group: ownProps.group,
    project: ownProps.project,
    results: get(
        state.results[ownProps.project.projectId],
        ownProps.group.groupId,
        null,
    ),
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
