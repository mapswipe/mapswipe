// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { FlatList } from 'react-native';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import TutorialBox from '../../common/Tutorial';
import { tutorialModes } from '../../constants';
import ChangeDetectionTask from './Task';
import { toggleMapTile } from '../../actions/index';

import type {
    ChangeDetectionGroupType,
    ChangeDetectionTaskType,
    NavigationProp,
    ResultType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

type Props = {
    screens: Array<TutorialContent>,
    group: ChangeDetectionGroupType,
    isSendingResults: boolean,
    navigation: NavigationProp,
    onToggleTile: (ResultType) => void,
    submitResult: (number, string) => void,
    tutorial: boolean,
    updateProgress: (number) => void,
};

type State = {
    groupCompleted: boolean,
};

class _ChangeDetectionTaskList extends React.Component<Props, State> {
    flatlist: ?FlatList<ChangeDetectionTaskType>;

    currentX: number;

    firstTouch: Object;

    previousTouch: Object;

    scrollEnabled: boolean;

    tapsExpected: number;

    tapsRegistered: number;

    tasksPerScreen: ?Array<Array<BuiltAreaTaskType>>;

    tutorialIntroWidth: number;

    constructor(props: Props) {
        super(props);
        this.flatlist = null;
        this.scrollEnabled = !props.tutorial;
        this.tasksPerScreen = 1;
        // we expect the user to do at least X taps/swipes on the screen to match the
        // expected results. We calculate this for each screen when we reach it, and
        // store it here so we can show the "show Answers" button if they've tapped more
        // than they should have in a "perfect" response.
        this.tapsExpected = 0;
        // keep a record of how many taps the user has done on the screen,
        // so we can show the answers button after X interactions (only for tutorial)
        this.tapsRegistered = 0;
        // the number of screens that the initial tutorial intro covers
        this.tutorialIntroWidth = 2;
        this.currentX =
            parseInt(props.group.xMin, 10) - this.tutorialIntroWidth;
        this.state = {
            showAnswerButtonIsVisible: false,
            showScaleBar: !props.tutorial,
            tutorialMode: tutorialModes.instructions,
        };
    }

    onScroll = (event: Object) => {
        // this event is triggered much more than once during scrolling
        // Updating the progress bar here allows a smooth transition
        const { group, updateProgress } = this.props;
        const {
            contentOffset: { x },
        } = event.nativeEvent;
        // we don't use the content width from the event as it changes
        // over the lifetime of the FlatList (because it gets updated
        // when the list is rerendered).
        const width = group.tasks
            ? group.tasks.length * GLOBAL.SCREEN_WIDTH * 0.8
            : 0;
        const progress = width === 0 ? 0 : x / width;
        updateProgress(progress);
        return progress;
    };

    getCurrentScreen = () => {
        // return the screen number for the tutorial examples.
        // The screens before the start of the content are numbered negatively
        // which allows to check whether we're showing an example or not
        // TODO: clean up the progress calculation, as we are using a few different
        // numbers that are all confusing
        const { currentX } = this;
        const { group } = this.props;
        const currentScreen = Math.floor((currentX - group.xMin));
        return currentScreen;
    };

    getNumberOfTapsExpectedForScreen = (screenNumber) => {
        // calculate how many taps/swipes the user is expected to do
        // to get the correct result by summing up reference answers for each
        // tile of the screen
        let result = 0;
        if (this.tasksPerScreen) {
            console.log('tps', this.tasksPerScreen, screenNumber);
            // $FlowFixMe
            if (this.tasksPerScreen[screenNumber]) {
                result = this.tasksPerScreen[screenNumber].reduce(
                    (sum, task) => sum + task.referenceAnswer,
                    0,
                );
            } else {
                // FIXME: in some unclear edge cases, the screenNumber is not
                // set properly, leading to the above reduce crashing
                // in that case, we just force a zero value, which is not perfect
                // but allows the user to move forward
                return 0;
            }
        }
        if (result === 18) {
            // the user should be swiping down, only 1 action expected
            result = 1;
        }
        return result;
    };

    onMomentumScrollEnd = (event: Object) => {
        // update the page number for the tutorial
        // we don't do this in onScroll as each scroll
        // triggers dozens of these events, whereas this happens
        // only once per page
        const {
            group: { xMax, xMin },
            tutorial,
        } = this.props;
        const progress = this.onScroll(event);
        if (tutorial) {
            // determine current taskX for tutorial
            const min = parseInt(xMin, 10);
            const max = parseInt(xMax, 10);
            // FIXME: currentX is incorrect after xMax because of next line
            this.currentX = Math.ceil(min + (max - min) * progress);
            // TODO: getCurrentScreen returns an incorrect value after the last sample screen
            const currentScreen = this.getCurrentScreen()
            console.log(
                'currentScreen',
                currentScreen,
            );
            if (currentScreen >= 0) {
                // we changed page, reset state variables
                // $FlowFixMe
                if (currentScreen >= this.tasksPerScreen) {
                    this.scrollEnabled = true;
                } else {
                    this.scrollEnabled = false;
                    this.tapsRegistered = 0; // remember to offset by 1 (see above)
                    this.tapsExpected = 1
                    this.setState({
                        tutorialMode: tutorialModes.instructions,
                        showAnswerButtonIsVisible: false,
                    });
                }
            };
        }
    };

    handleTutorialScrollCapture = (event: Object) => {
        // Only used when running the tutorial
        // when scrolling is disabled, determine if the user
        // tried to scroll, and respond accordingly
        const e = event.nativeEvent;
        const { tutorial } = this.props;
        const currentScreen = this.getCurrentScreen();
        if (
            tutorial &&
            currentScreen >= 0 &&
            // $FlowFixMe
            currentScreen < this.tasksPerScreen &&
            !this.scrollEnabled
        ) {
            // swiping is disabled in the flatlist component, so we need to detect swipes
            // by ourselves. This relies on capturing touch events, and figuring what is
            // happening
            if (
                this.firstTouch === undefined ||
                (e.identifier === this.previousTouch.identifier &&
                    e.timestamp - this.previousTouch.timestamp > 100)
            ) {
                // during a swipe, events are fired at about 15-30ms interval
                // so at more than 100ms interval, we probably have a new touch event
                // this is probably the start of a swipe
                this.firstTouch = e;
                this.previousTouch = e;
            } else {
                // we're swiping! The finger is probably moving across the screen, so
                // we are receiving a stream of events that are very close to each other
                // in time
                const swipeX = e.pageX - this.firstTouch.pageX;
                const swipeY = e.pageY - this.firstTouch.pageY;
                this.previousTouch = e;
                if (
                    -swipeX > GLOBAL.SCREEN_WIDTH * 0.2 &&
                    -swipeX > 3 * Math.abs(swipeY)
                ) {
                    this.checkTutorialAnswers();
                    // we have a horizontal left swipe, claim this touch
                    return true;
                }
            }
        }
        // we're not interested in this touch, leave it to some other component
        return false;
    };

    toNextGroup = () => {
        const { navigation, updateProgress } = this.props;
        navigation.navigate('ChangeDetectionScreen');
        if (this.flatlist) {
            this.flatlist.scrollToIndex({ animated: false, index: 0 });
        }
        updateProgress(0);
    };

    render = () => {
        const { currentX } = this;
        const {
            group,
            isSendingResults,
            navigation,
            onToggleTile,
            submitResult,
            screens,
            tutorial,
        } = this.props;
        if (!group || !group.tasks || isSendingResults) {
            return <LoadingIcon />;
        }
        console.log(this.scrollEnabled)

        return (
            <FlatList
                style={{
                    height: '100%',
                    width: GLOBAL.SCREEN_WIDTH,
                }}
                data={group.tasks}
                decelerationRate="fast"
                disableIntervalMomentum
                keyExtractor={(task) => task.taskId}
                horizontal
                initialNumToRender={1}
                ListFooterComponent={
                    <LoadMoreCard
                        group={group}
                        navigation={navigation}
                        toNextGroup={this.toNextGroup}
                        projectId={group.projectId}
                        tutorial={tutorial}
                    />
                }
                onScroll={this.onScroll}
                onMomentumScrollEnd={this.onMomentumScrollEnd}
                onMoveShouldSetResponderCapture={
                        this.handleTutorialScrollCapture
                    }
                pagingEnabled
                // eslint-disable-next-line no-return-assign
                ref={(r) => (this.flatlist = r)}
                renderItem={({ item, index }) => (
                    <ChangeDetectionTask
                        screens={screens}
                        index={index}
                        onToggleTile={onToggleTile}
                        submitResult={submitResult}
                        task={item}
                        tutorial={tutorial}
                    />
                )}
                scrollEnabled={
                    this.scrollEnabled || this.getCurrentScreen() < 0
                }
                snapToInterval={GLOBAL.SCREEN_WIDTH * 0.8}
                showsHorizontalScrollIndicator={false}
            />
        );
    };
}

const mapStateToProps = (state, ownProps) => ({
    commitCompletedGroup: ownProps.commitCompletedGroup,
    group: ownProps.group,
    isSendingResults: state.ui.user.isSendingResults,
    submitResult: ownProps.submitResult,
});

const mapDispatchToProps = (dispatch) => ({
    onToggleTile: (tileInfo) => {
        dispatch(toggleMapTile(tileInfo));
    },
});

export default compose(
    firebaseConnect((props) => {
        // wait for the group data to be available in redux-firebase
        if (props.group) {
            const { groupId, projectId } = props.group;
            const prefix = props.tutorial ? 'tutorial' : 'projects';
            if (groupId !== undefined) {
                const r = props.results;
                // also wait for the startTime timestamp to be set (by START_GROUP)
                // if we don't wait, when opening a project for the second time
                // group is already set from before, so the tasks listener is often
                // set before the groups one, which results in tasks being received
                // before the group. The groups then remove the tasks list from
                // redux, and we end up not being able to show anything.
                // This is a bit hackish, and may not work in all situations, like
                // on slow networks.
                if (
                    r[projectId] &&
                    r[projectId][groupId] &&
                    r[projectId][groupId].startTime
                ) {
                    return [
                        {
                            type: 'once',
                            path: `v2/tasks/${projectId}/${groupId}`,
                            storeAs: `${prefix}/${projectId}/groups/${groupId}/tasks`,
                        },
                    ];
                }
            }
        }
        return [];
    }),
    connect(mapStateToProps, mapDispatchToProps),
)(_ChangeDetectionTaskList);
