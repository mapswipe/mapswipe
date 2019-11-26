// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import {
    Image,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { type PressEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import type {
    GestureState,
    PanResponderInstance,
} from 'react-native/Libraries/Interaction/PanResponder';
import LinearGradient from 'react-native-linear-gradient';
import LoadingIcon from '../LoadingIcon';
import TutorialBox from '../../common/Tutorial';
import SatImage from '../../common/SatImage';
import {
    COLOR_DARK_GRAY,
    COLOR_GREEN,
    COLOR_LIGHT_GRAY,
    COLOR_RED,
    COLOR_TRANSPARENT_LIGHT_GRAY,
    COLOR_TRANSPARENT_GREEN,
    COLOR_TRANSPARENT_RED,
    COLOR_TRANSPARENT_YELLOW,
    COLOR_WHITE,
    COLOR_YELLOW,
} from '../../constants';

import type {
    CategoriesType,
    ChangeDetectionGroupType,
    ChangeDetectionTaskType,
} from '../../flow-types';

const styles = StyleSheet.create({
    leftButton: {
        borderRadius: 0,
        borderWidth: 0,
        height: '100%',
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    bottomButton: {
        borderRadius: 0,
        borderWidth: 0,
        bottom: 0,
        justifyContent: 'center',
        // left: '15%',
        marginBottom: 0,
        marginTop: 0,
        position: 'absolute',
        width: '100%',
        zIndex: 1,
    },
    rightButton: {
        borderRadius: 0,
        borderWidth: 0,
        height: '100%',
        justifyContent: 'center',
        right: 0,
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    topButton: {
        borderRadius: 0,
        borderWidth: 0,
        justifyContent: 'center',
        // left: '15%',
        position: 'absolute',
        top: 0,
        width: '100%',
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
    sideText: {
        fontSize: 13,
        textAlign: 'center',
    },
    overlayText: {
        color: COLOR_LIGHT_GRAY,
        fontSize: 20,
        paddingLeft: 5,
        textShadowColor: COLOR_DARK_GRAY,
        textShadowRadius: 30,
    },
});

// result codes to be sent back to backend
const CHANGES_NO_CHANGES_DETECTED = 0;
const CHANGES_CHANGES_DETECTED = 1;
const CHANGES_UNSURE = 2;
const CHANGES_BAD_IMAGERY = 3;

// swiping settings
// swipe ratio: ratio of finger travel distance over the cross distance, defines how
// "horizontal" or "vertical" a swipe must be to be considered.
// Minimum is 1, which will consider any swipe of sufficient length, but will make it
// less obvious which direction is wanted as a 45 degree swipe will be acceptable.
// There is no maximum value, but 4 or 5 is probably reasonable.
const swipeRatio = 3;
// Minimum distance to be travelled for the swipe to be considered. It is expressed as
// a ratio of the image width (or height, as they are squares).
const minSwipeLength = 0.2;
// The ratio between distance swiped and the size of the side button
const swipeToSizeRatio = 2;

const minSize = 0;

type Props = {
    categories: CategoriesType,
    commitCompletedGroup: () => void,
    group: ChangeDetectionGroupType,
    submitResult: (number, string) => void,
    tutorial: boolean,
    updateProgress: (number) => void,
};

const tutorialModes = {
    pre: 'pre',
    post_correct: 'post_correct',
    post_wrong: 'post_wrong',
};

type State = {
    currentTaskId: string,
    bottomSize: number,
    leftSize: number,
    rightSize: number,
    topSize: number,
    tutorialMode: $Keys<typeof tutorialModes>,
};

// see https://zhenyong.github.io/flowtype/blog/2015/11/09/Generators.html
type taskGenType = Generator<string, void, void>;

class _ChangeDetector extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentTaskId: this.setupTaskIdGenerator(props.group.tasks),
            bottomSize: minSize,
            leftSize: minSize,
            rightSize: minSize,
            topSize: minSize,
            tutorialMode: tutorialModes.pre,
        };
        this.tasksDone = 0;
        this.imageSize = 250;
        this.swipeThreshold = this.imageSize * minSwipeLength;
        this.lockedSize = this.swipeThreshold * swipeToSizeRatio;

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
            this.prefetchImages(group.tasks);
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
        // we increase the size of the side that we think the finger is
        // aiming towards.
        const { tutorial } = this.props;
        const { tutorialMode } = this.state;
        if (tutorial && tutorialMode === tutorialModes.post_correct) {
            return; // disable side animations once we have a correct answer
        }

        const { dx, dy } = gestureState;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const sizeX = absX > this.swipeThreshold ? this.lockedSize : absX * swipeToSizeRatio;
        const sizeY = absY > this.swipeThreshold ? this.lockedSize : absY * swipeToSizeRatio;

        if (dx < 0 && absX > absY * swipeRatio) {
            // we're headed for a no
            this.setState({
                bottomSize: minSize,
                leftSize: sizeX,
                rightSize: minSize,
                topSize: minSize,
            });
        } else if (dx > 0 && absX > absY * swipeRatio) {
            this.setState({
                bottomSize: minSize,
                leftSize: minSize,
                rightSize: sizeX,
                topSize: minSize,
            });
        } else if (dy < 0 && absY > absX * swipeRatio) {
            this.setState({
                bottomSize: minSize,
                leftSize: minSize,
                rightSize: minSize,
                topSize: sizeY,
            });
        } else if (dy > 0 && absY > absX * swipeRatio) {
            this.setState({
                bottomSize: sizeY,
                leftSize: minSize,
                rightSize: minSize,
                topSize: minSize,
            });
        }
    };

    getViewSize = ({ nativeEvent: { layout: { height } } }) => {
        this.imageSize = height * 0.49;
        this.swipeThreshold = this.imageSize * minSwipeLength;
        this.lockedSize = this.swipeThreshold * swipeToSizeRatio;
    };

    checkTutorialAnswers = (answer: number) => {
        const {
            group,
        } = this.props;
        const { currentTaskId } = this.state;
        const currentTask = group.tasks.find(t => t.taskId === currentTaskId);
        // $FlowFixMe
        if (currentTask.referenceAnswer === answer) {
            this.setState({ tutorialMode: tutorialModes.post_correct });
        } else {
            this.setState({ tutorialMode: tutorialModes.post_wrong });
        }
    };

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        const { dx, dy } = gestureState;
        const {
            commitCompletedGroup,
            group,
            tutorial,
            updateProgress,
        } = this.props;
        const { tutorialMode } = this.state;

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        this.resetOpacities();
        // discard very short swipes
        if (absX + absY < this.swipeThreshold) {
            return false;
        }

        if (tutorial && tutorialMode === tutorialModes.post_correct) {
            // we ignore "normal" swipes, we now expect a simple left swipe
            if (dx < 0 && absX > 5) {
                const { done, value } = this.taskGen.next();
                if (done) {
                    // no more tasks in the group, commit results and go back to menu
                    commitCompletedGroup();
                }
                this.tasksDone += 1;
                updateProgress(this.tasksDone / group.numberOfTasks);
                this.setState({ currentTaskId: value, tutorialMode: tutorialModes.pre });
            }
            return false;
        }

        const f = tutorial ? this.checkTutorialAnswers : this.nextTask;

        // determine the direction of the swipe
        if (dx < 0 && absX > absY * swipeRatio && absX > this.swipeThreshold) {
            f(CHANGES_NO_CHANGES_DETECTED);
        } else if (dx > 0 && absX > absY * swipeRatio && absX > this.swipeThreshold) {
            f(CHANGES_CHANGES_DETECTED);
        } else if (dy < 0 && absY > absX * swipeRatio && absY > this.swipeThreshold) {
            f(CHANGES_BAD_IMAGERY);
        } else if (dy > 0 && absY > absX * swipeRatio && absY > this.swipeThreshold) {
            f(CHANGES_UNSURE);
        }
        return false;
    };

    handlePanResponderTerminate = () => {
        // swipe cancelled, eg: some other component took over (ScrollView?)
        this.resetOpacities();
    };

    prefetchImages = (tasks) => {
        const prefetchIds = [];
        tasks.forEach((task) => {
            prefetchIds.push(Image.prefetch(task.urlA));
            prefetchIds.push(Image.prefetch(task.urlB));
        });
        return prefetchIds;
    };

    resetOpacities = () => {
        this.setState({
            bottomSize: minSize,
            leftSize: minSize,
            rightSize: minSize,
            topSize: minSize,
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
    }

    imageSize: number;

    lockedSize: number;

    panResponder: PanResponderInstance;

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
        const { categories, group, tutorial } = this.props;
        const {
            bottomSize,
            currentTaskId,
            leftSize,
            rightSize,
            topSize,
            tutorialMode,
        } = this.state;
        if (!group.tasks) {
            return <LoadingIcon />;
        }
        const currentTask = group.tasks.find(t => t.taskId === currentTaskId);

        if (currentTask === undefined) {
            return <LoadingIcon />;
        }

        let tutorialText: string = '';

        if (tutorial && group.tasks) {
            const { category } = currentTask;
            // $FlowFixMe see https://stackoverflow.com/a/54010838/1138710
            tutorialText = categories[category][tutorialMode];
        }

        let sideTextColor = COLOR_DARK_GRAY;
        if (leftSize + rightSize + topSize + bottomSize >= this.lockedSize) {
            sideTextColor = COLOR_WHITE;
        }

        return (
            <>
                <View
                    {...this.panResponder.panHandlers}
                    onLayout={this.getViewSize}
                    style={{
                        alignItems: 'center',
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <LinearGradient
                        colors={[COLOR_RED, COLOR_TRANSPARENT_RED]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[{ width: leftSize }, styles.leftButton]}
                    >
                        <Text style={[{ color: sideTextColor }, styles.sideText]}>No</Text>
                    </LinearGradient>
                    <LinearGradient
                        colors={[COLOR_LIGHT_GRAY, COLOR_TRANSPARENT_LIGHT_GRAY]}
                        style={[{ height: topSize }, styles.topButton]}
                    >
                        {topSize > 0
                            && (
                                <Text style={[{ color: sideTextColor }, styles.sideText]}>
                                    Bad imagery
                                </Text>
                            )
                        }
                    </LinearGradient>
                    <SatImage
                        overlayText="Before"
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: currentTask.urlA }}
                        style={styles.topImage}
                    />
                    <SatImage
                        overlayText="After"
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: currentTask.urlB }}
                        style={styles.bottomImage}
                    />
                    <LinearGradient
                        colors={[COLOR_TRANSPARENT_YELLOW, COLOR_YELLOW]}
                        style={[{ height: bottomSize }, styles.bottomButton]}
                    >
                        {bottomSize > 0
                            && (
                                <Text style={[{ color: sideTextColor }, styles.sideText]}>
                                    Not sure
                                </Text>
                            )
                        }
                    </LinearGradient>
                    <LinearGradient
                        colors={[COLOR_GREEN, COLOR_TRANSPARENT_GREEN]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={[{ width: rightSize }, styles.rightButton]}
                    >
                        <Text style={[{ color: sideTextColor }, styles.sideText]}>Yes</Text>
                    </LinearGradient>
                </View>
                { tutorial && tutorialText !== ''
                && (
                    <TutorialBox>
                        { tutorialText }
                    </TutorialBox>
                )
                }
            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        commitCompletedGroup: ownProps.commitCompletedGroup,
        group: ownProps.group,
        submitResult: ownProps.submitResult,
    }
);

export default compose(
    firebaseConnect((props) => {
        if (props.group) {
            const { groupId, projectId } = props.group;
            const prefix = props.tutorial ? 'tutorial' : 'projects';
            if (groupId !== undefined) {
                return [
                    {
                        type: 'once',
                        path: `v2/tasks/${projectId}/${groupId}`,
                        storeAs: `${prefix}/${projectId}/groups/${groupId}/tasks`,
                    },
                ];
            }
        }
        return [];
    }),
    connect(
        mapStateToProps,
    ),
)(_ChangeDetector);
