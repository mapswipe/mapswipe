// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import {
    Image,
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';
import Button from 'apsl-react-native-button';
import LoadingIcon from '../LoadingIcon';
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
        opacity: 0.5,
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
        opacity: 0.5,
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
        opacity: 0.5,
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
        opacity: 0.5,
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
    sidesVisible: boolean,
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
            sidesVisible: false,
        };
        this.tasksDone = 0;
        this.imageSize = 250;

        this.swipeThreshold = 3;

        this.viewHeight = 0;
        this.viewTop = 0;
        this.viewWidth = 0;

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onPanResponderGrant: this.handlePanResponderGrant,
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

    setViewDimensions = (evt: { nativeEvent : { layout: {
        x: number,
        y: number,
        width: number,
        height: number,
    }}}) => {
        console.log('setVD', evt, evt.nativeEvent.layout);
        this.viewWidth = evt.nativeEvent.layout.width;
        this.viewHeight = evt.nativeEvent.layout.height;
        this.viewTop = evt.nativeEvent.layout.y;
    }

    // decide if we handle the move event: only if it has moved a little
    handleMoveShouldSetPanResponder = (
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => Math.abs(gestureState.dx + gestureState.dy) > 3;

    handlePanResponderGrant = (
        event: PressEvent,
        gestureState: GestureState,
    ) => {
        // OK, we've been given this swipe to handle, show feedback to the user
        console.log('Grant', gestureState.numberActiveTouches);
        this.setState({ sidesVisible: true });
    };

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        this.setState({ sidesVisible: false });
        const { moveX, moveY } = gestureState;
        const height = this.viewHeight;
        const top = this.viewTop;
        const width = this.viewWidth;

        // determine where the swipe ended
        if (moveX < width * 0.15) {
            this.nextTask(CHANGES_NO_CHANGES_DETECTED);
        } else if (moveX > width * 0.85) {
            this.nextTask(CHANGES_CHANGES_DETECTED);
        } else if (moveY < top + height * 0.1 && moveX > width * 0.15 && moveX < width * 0.85) {
            this.nextTask(CHANGES_BAD_IMAGERY);
        } else if (moveY > top + height * 0.9 && moveX > width * 0.15 && moveX < width * 0.85) {
            this.nextTask(CHANGES_UNSURE);
        }
        return false;
    };

    handlePanResponderTerminate = () => {
        // swipe cancelled, eg: some other component took over (ScrollView?)
        this.setState({ sidesVisible: false });
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

    // rendered size of the view used for swipes
    viewHeight: number;

    viewTop: number;

    viewWidth: number;

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
        const { currentTaskId, sidesVisible } = this.state;
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
                onLayout={this.setViewDimensions}
                style={{
                    alignItems: 'center',
                    flexDirection: 'column',
                    height: GLOBAL.TILE_VIEW_HEIGHT,
                    justifyContent: 'space-between',
                }}
            >
                { sidesVisible
                    ? (
                        <>
                            <Button
                                onPress={() => this.nextTask(CHANGES_NO_CHANGES_DETECTED)}
                                style={[styles.leftButton]}
                            >
                                No
                            </Button>
                            <Button
                                onPress={() => this.nextTask(CHANGES_BAD_IMAGERY)}
                                style={[styles.topButton]}
                            >
                                Bad imagery
                            </Button>
                        </>
                    )
                    : null }
                <Image
                    source={{ uri: currentTask.urlA }}
                    style={styles.topImage}
                />
                <Image
                    source={{ uri: currentTask.urlB }}
                    style={styles.bottomImage}
                />
                { sidesVisible
                    ? (
                        <>
                            <Button
                                onPress={() => this.nextTask(CHANGES_UNSURE)}
                                style={[styles.bottomButton]}
                            >
                                Not sure
                            </Button>
                            <Button
                                onPress={() => this.nextTask(CHANGES_CHANGES_DETECTED)}
                                style={[styles.rightButton]}
                            >
                                Yes
                            </Button>
                        </>
                    )
                    : null }
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
