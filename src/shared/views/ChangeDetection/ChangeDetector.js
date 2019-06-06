// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import {
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';
import Button from 'apsl-react-native-button';
import LoadingIcon from '../LoadingIcon';
import SatImage from '../../common/SatImage';
import GLOBAL from '../../Globals';
import {
    COLOR_GREEN,
    COLOR_LIGHT_GRAY,
    COLOR_RED,
    COLOR_YELLOW,
} from '../../constants';

import type {
    ChangeDetectionGroupType,
    ChangeDetectionTaskType,
} from '../../flow-types';

const styles = StyleSheet.create({
    leftButton: {
        backgroundColor: COLOR_RED,
        borderRadius: 0,
        borderWidth: 0,
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '15%',
        zIndex: 1,
    },
    bottomButton: {
        backgroundColor: COLOR_YELLOW,
        borderRadius: 0,
        borderWidth: 0,
        bottom: 0,
        height: '10%',
        left: '15%',
        marginBottom: 0,
        marginTop: 0,
        position: 'absolute',
        width: '70%',
        zIndex: 1,
    },
    rightButton: {
        backgroundColor: COLOR_GREEN,
        borderRadius: 0,
        borderWidth: 0,
        height: '100%',
        right: 0,
        position: 'absolute',
        top: 0,
        width: '15%',
        zIndex: 1,
    },
    topButton: {
        backgroundColor: COLOR_LIGHT_GRAY,
        borderRadius: 0,
        borderWidth: 0,
        height: '10%',
        left: '15%',
        position: 'absolute',
        top: 0,
        width: '70%',
        zIndex: 1,
    },
    bottomImage: {
        // this style might break on very elongated screens
        // with aspect ratio higher than 16:9, where the images
        // might be cropped on the sides (as of writing this,
        // only a couple of phones fall into that group, so we
        // ignore them for now)
        // see https://stackoverflow.com/a/23009368/1138710
        aspectRatio: 1,
        height: '49%',
    },
    topImage: {
        aspectRatio: 1,
        height: '49%',
    },
});

// result codes to be sent back to backend
const CHANGES_NO_CHANGES_DETECTED = 0;
const CHANGES_CHANGES_DETECTED = 1;
const CHANGES_UNSURE = 2;
const CHANGES_BAD_IMAGERY = 3;

type Props = {
    commitCompletedGroup: () => void,
    group: ChangeDetectionGroupType,
    submitChangeResult: (number, string) => void,
    updateProgress: (number) => void,
};

type State = {
    currentTaskId: string,
    bottomOpacity: number,
    leftOpacity: number,
    rightOpacity: number,
    topOpacity: number,
};

type GestureState = PanResponder.GestureState;
type PressEvent = PanResponder.PressEvent;

// see https://zhenyong.github.io/flowtype/blog/2015/11/09/Generators.html
type taskGenType = Generator<string, void, void>;

class _Validator extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentTaskId: this.setupTaskIdGenerator(props.group.tasks),
            bottomOpacity: 0,
            leftOpacity: 0,
            rightOpacity: 0,
            topOpacity: 0,
        };
        this.tasksDone = 0;
        this.imageSize = 250;

        this.swipeThreshold = 3;

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderTerminate,
        });
    }

    componentDidUpdate = (prevProps: Props) => {
        // reset the taskId generator, as it might have been initialized on another project group
        const { group } = this.props;
        if (prevProps.group.tasks !== group.tasks) {
            const currentTaskId = this.setupTaskIdGenerator(group.tasks);
            this.tasksDone = 0;
            this.setState({ currentTaskId });
        }
    }

    // decide if we handle the move event: only if it has moved a little
    handleMoveShouldSetPanResponder = (
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => Math.abs(gestureState.dx + gestureState.dy) > 3;

    handlePanResponderGrant = () => {
        // OK, we've been given this swipe to handle, show feedback to the user
    };

    handlePanResponderMove = (event: PressEvent, gestureState: GestureState) => {
        // we have captured the swipe, now the user's finger is moving on the
        // screen, show a visual hint that something is happening:
        // we increase the opacity of the side that we think the finger is
        // aiming towards.
        const { dx, dy } = gestureState;
        const D = this.imageSize * 0.4;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const swipeRatio = 3; // the ratio of x/y that decides whether we have a clear direction

        if (dx < 0 && absX > absY * swipeRatio) {
            // we're headed for a no
            this.setState({
                bottomOpacity: 0,
                leftOpacity: 0.1 + (absX / D) * 0.9,
                rightOpacity: 0,
                topOpacity: 0,
            });
        } else if (dx > 0 && absX > absY * swipeRatio) {
            this.setState({
                bottomOpacity: 0,
                leftOpacity: 0,
                rightOpacity: 0.1 + (absX / D) * 0.9,
                topOpacity: 0,
            });
        } else if (dy < 0 && absY > absX * swipeRatio) {
            this.setState({
                bottomOpacity: 0,
                leftOpacity: 0,
                rightOpacity: 0,
                topOpacity: 0.1 + (absY / D) * 0.9,
            });
        } else if (dy > 0 && absY > absX * swipeRatio) {
            this.setState({
                bottomOpacity: 0.1 + (absY / D) * 0.9,
                leftOpacity: 0,
                rightOpacity: 0,
                topOpacity: 0,
            });
        }
    };

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        const { dx, dy } = gestureState;
        const swipeRatio = 3; // the ratio of x/y that decides whether we have a clear direction

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        this.resetOpacities();
        // discard very short swipes
        if (absX + absY < this.imageSize * 0.4) {
            return false;
        }
        // determine the direction of the swipe
        if (dx < 0 && absX > absY * swipeRatio) {
            this.nextTask(CHANGES_NO_CHANGES_DETECTED);
        } else if (dx > 0 && absX > absY * swipeRatio) {
            this.nextTask(CHANGES_CHANGES_DETECTED);
        } else if (dy < 0 && absY > absX * swipeRatio) {
            this.nextTask(CHANGES_BAD_IMAGERY);
        } else if (dy > 0 && absY > absX * swipeRatio) {
            this.nextTask(CHANGES_UNSURE);
        }
        return false;
    };

    handlePanResponderTerminate = () => {
        // swipe cancelled, eg: some other component took over (ScrollView?)
        this.resetOpacities();
    };

    resetOpacities = () => {
        this.setState({
            bottomOpacity: 0,
            leftOpacity: 0,
            rightOpacity: 0,
            topOpacity: 0,
        });
    };

    setupTaskIdGenerator = (tasks: Array<ChangeDetectionTaskType>) => {
        if (isLoaded(tasks) && !isEmpty(tasks)) {
            this.taskGen = this.makeNextTaskGenerator(tasks);
            const taskGenValue = this.taskGen.next();
            if (!taskGenValue.done) {
                return taskGenValue.value;
            }
        }
        return ''; // to keep flow and eslint happy
    }

    nextTask = (result: number) => {
        const {
            commitCompletedGroup,
            group,
            submitChangeResult,
            updateProgress,
        } = this.props;
        const { currentTaskId } = this.state;
        submitChangeResult(result, currentTaskId);
        const { done, value } = this.taskGen.next();
        if (done) {
            // no more tasks in the group, commit results and go back to menu
            commitCompletedGroup();
        }
        this.tasksDone += 1;
        updateProgress(this.tasksDone / group.numberOfTasks);
        this.setState({ currentTaskId: value });
    }

    imageSize: number;

    leftOpacity: number;

    panResponder: PanResponder.PanResponderInstance;

    swipeThreshold: number;

    taskGen: taskGenType;

    tasksDone: number;

    // eslint-disable-next-line class-methods-use-this
    * makeNextTaskGenerator(tasks: Array<ChangeDetectionTaskType>): taskGenType {
        // generator function that picks the next task to work on
        // we cannot assume any specific order of taskId in the group
        const taskIds = tasks.map(t => t.taskId);
        let i;
        // eslint-disable-next-line no-plusplus
        for (i = 0; i < taskIds.length; i++) {
            yield taskIds[i];
        }
    }

    render = () => {
        const { group } = this.props;
        const {
            bottomOpacity,
            currentTaskId,
            leftOpacity,
            rightOpacity,
            topOpacity,
        } = this.state;
        if (!group.tasks) {
            return <LoadingIcon />;
        }
        const currentTask = group.tasks.find(t => t.taskId === currentTaskId);
        if (currentTask === undefined) {
            return <LoadingIcon />;
        }
        return (
            <View
                {...this.panResponder.panHandlers}
                style={{
                    alignItems: 'center',
                    flexDirection: 'column',
                    height: GLOBAL.TILE_VIEW_HEIGHT,
                    justifyContent: 'space-between',
                }}
            >
                <Button
                    onPress={() => this.nextTask(CHANGES_NO_CHANGES_DETECTED)}
                    style={[{ opacity: leftOpacity }, styles.leftButton]}
                >
                    No
                </Button>
                <Button
                    onPress={() => this.nextTask(CHANGES_BAD_IMAGERY)}
                    style={[{ opacity: topOpacity }, styles.topButton]}
                >
                    Bad imagery
                </Button>
                <SatImage
                    source={{ uri: currentTask.urlA }}
                    style={styles.topImage}
                />
                <SatImage
                    source={{ uri: currentTask.urlB }}
                    style={styles.bottomImage}
                />
                <Button
                    onPress={() => this.nextTask(CHANGES_UNSURE)}
                    style={[{ opacity: bottomOpacity }, styles.bottomButton]}
                >
                    Not sure
                </Button>
                <Button
                    onPress={() => this.nextTask(CHANGES_CHANGES_DETECTED)}
                    style={[{ opacity: rightOpacity }, styles.rightButton]}
                >
                    Yes
                </Button>
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        commitCompletedGroup: ownProps.commitCompletedGroup,
        group: ownProps.group,
        project: ownProps.project,
        submitChangeResult: ownProps.submitChangeResult,
    }
);

export default compose(
    firebaseConnect((props) => {
        if (props.group) {
            const { groupId } = props.group;
            return [
                {
                    type: 'once',
                    path: `tasks/${props.project.projectId}/${groupId}`,
                    storeAs: `group/${groupId}/tasks`,
                },
            ];
        }
        return [];
    }),
    connect(
        mapStateToProps,
    ),
)(_Validator);
