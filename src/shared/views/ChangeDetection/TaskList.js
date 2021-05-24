// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { FlatList, StyleSheet } from 'react-native';
import get from 'lodash.get';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import TutorialBox from '../../common/Tutorial';
import { tutorialModes } from '../../constants';
import ShowAnswersButton from '../../common/Tutorial/ShowAnswersButton';
import ChangeDetectionTask from './Task';
import { toggleMapTile } from '../../actions/index';

import type {
    ChangeDetectionGroupType,
    ChangeDetectionTaskType,
    NavigationProp,
    ResultMapType,
    ResultType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

type Props = {
    screens: Array<TutorialContent>,
    group: ChangeDetectionGroupType,
    isSendingResults: boolean,
    navigation: NavigationProp,
    onToggleTile: (ResultType) => void,
    results: ResultMapType,
    submitResult: (number, string) => void,
    tutorial: boolean,
    tutorialId: string,
    updateProgress: (number) => void,
};

type State = {
    groupCompleted: boolean,
    showAnswerButtonIsVisible: boolean,
    tutorialBoxIsVisible: boolean,
    tutorialMode: $Keys<typeof tutorialModes>,
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
        this.tutorialIntroWidth = 0;
        this.currentScreen = 0  //- this.tutorialIntroWidth;
        this.currentX =
            parseInt(props.group.xMin, 10) - this.tutorialIntroWidth;
        this.state = {
            showAnswerButtonIsVisible: false,
            tutorialBoxIsVisible: props.tutorial,
            showScaleBar: !props.tutorial,
            tutorialMode: tutorialModes.instructions,
        };
    }

    componentDidUpdate = (oldProps: Props) => {
        const { results, tutorial } = this.props;
        const { tutorialMode, showAnswerButtonIsVisible } = this.state;
        const currentScreen = this.getCurrentScreen();
        if (tutorial && results !== oldProps.results && currentScreen >= 0) {
            // we're cheating here: we use the fact that props are updated when the user
            // taps a tile to check the answers, instead of responding to the tap event.
            // This is to avoid having to pass callbacks around all the way down to the tiles.
            // to prevent mistaking prop updates for taps, we check that at least one result
            // is non-zero
            const allCorrect = this.checkTutorialAnswers();
            console.log('all correct: '+ allCorrect)
        }
    };

    onScroll = (event: Object) => {
        // this event is triggered much more than once during scrolling
        // Updating the progress bar here allows a smooth transition
        const { group, results,  updateProgress } = this.props;
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

    onMomentumScrollEnd = (event: Object) => {
        // update the page number for the tutorial
        // we don't do this in handleScroll as each scroll
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

            console.log('max: ' + max)

            // FIXME: currentX is incorrect after xMax because of next line
            this.currentX = Math.ceil(min + (max - min) * progress);
            // getCurrentScreen returns an incorrect value after the last sample screen
            const currentScreen = Math.round(
                event.nativeEvent.contentOffset.x / GLOBAL.SCREEN_WIDTH -
                    this.tutorialIntroWidth,
            );
            console.log(
                'currentScreen',
                currentScreen,
                (this.currentX - min) / 2,
                this.getCurrentScreen(),
            );
            if (currentScreen >= 0) {
                // we changed page, reset state variables
                // $FlowFixMe
                this.scrollEnabled = false;
                this.setState({
                    tutorialMode: tutorialModes.instructions,
                    showAnswerButtonIsVisible: false,
                });
            }
            this.setState({
                showScaleBar: progress < 0.99 && currentScreen >= 0,
            });
        } else {
            this.setState({ showScaleBar: progress < 0.99 });
        }
    };

    getCurrentScreen = () => {
        // return the screen number for the tutorial examples.
        // The screens before the start of the content are numbered negatively
        // which allows to check whether we're showing an example or not
        const { currentX } = this;
        const { group } = this.props;
        const currentScreen = Math.floor((currentX - group.xMin));
        return currentScreen;
    };

    showAnswers = () => {
        const { onToggleTile, group } = this.props;
        const currentScreen = this.getCurrentScreen();
        // set each tile to its reference value
        // $FlowFixMe

        const taskId = group['tasks'][currentScreen]['taskId']
        const referenceAnswer = group['tasks'][currentScreen]['referenceAnswer']

        onToggleTile({
            groupId: group.groupId,
            resultId: taskId,
            // $FlowFixMe
            result: referenceAnswer,
            projectId: group.projectId,
        });
        this.scrollEnabled = true;
        this.setState({
            tutorialMode: tutorialModes.hint,
            showAnswerButtonIsVisible: false,
            tutorialBoxIsVisible: true,
        });
    };

    checkTutorialAnswers = (): boolean => {
        const { group, results } = this.props;
        const { tutorialBoxIsVisible, tutorialMode } = this.state;
        if (group['tasks']) {
            const currentScreen = this.getCurrentScreen()
            const referenceAnswer = group['tasks'][currentScreen]['referenceAnswer']
            const taskId = group['tasks'][currentScreen]['taskId']
            const answer = results[taskId]

            if (answer === referenceAnswer ) {
                this.scrollEnabled = true;
                if (tutorialMode === tutorialModes.instructions) {
                    // the user got it on her own
                    console.log('the user got it right')
                    this.setState({
                        tutorialMode: tutorialModes.success,
                        showAnswerButtonIsVisible: false,
                        tutorialBoxIsVisible: true,
                    });
                } else {
                    // the user used the show answers button
                    console.log('used show answers button')
                    this.setState({
                        tutorialMode: tutorialModes.hint,
                        showAnswerButtonIsVisible: false,
                        tutorialBoxIsVisible: true,
                    });
                }
                return true
            } else if (answer < referenceAnswer) {
                // the user might still get it right
                // and get to the correct answer
                this.scrollEnabled = false;
                this.setState({ tutorialMode: tutorialModes.instructions });
                return false
            } else {
                // the answer was not correct
                // and the
                this.scrollEnabled = false;
                this.setState({
                    tutorialMode: tutorialModes.hint,
                    showAnswerButtonIsVisible: true,
                    tutorialBoxIsVisible: false,
                });
                return false
            }
        }
        return true
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

            console.log('we need to check the answer to enable swiping')

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
                console.log('we are swiping.')
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
        const { tutorialMode, showAnswerButtonIsVisible, tutorialBoxIsVisible } = this.state;
        if (!group || !group.tasks || isSendingResults) {
            return <LoadingIcon />;
        }
        const currentScreen = this.getCurrentScreen();
        let tutorialContent: ?TutorialContent;
        if (tutorial) {
            // $FlowFixMe see https://stackoverflow.com/a/54010838/1138710
            tutorialContent = screens[currentScreen][tutorialMode];
        }

        console.log('current screen in render: ' + this.getCurrentScreen())
        console.log('current x: ' + currentX)
        console.log('scroll enabled: ' + this.scrollEnabled)
        console.log('tutorial mode: ' + tutorialMode)
        console.log('tutorial content')
        console.log(tutorialContent)
        console.log('show answer button: ' + showAnswerButtonIsVisible)

        return (
            <>
            <FlatList
                style={{
                    height: '100%',
                    width: GLOBAL.SCREEN_WIDTH
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
            {tutorial &&
                tutorialBoxIsVisible && (
                    <TutorialBox
                        content={tutorialContent}
                        boxType={tutorialMode}
                        bottomOffset="45%"
                        topOffset="5%"
                    />
            )}
            {tutorial && showAnswerButtonIsVisible && (
                    <ShowAnswersButton onPress={this.showAnswers} />
                )}
            </>
        );
    };
}

const mapStateToProps = (state, ownProps) => ({
    commitCompletedGroup: ownProps.commitCompletedGroup,
    group: ownProps.group,
    isSendingResults: state.ui.user.isSendingResults,
    results: get(
        state.results[ownProps.tutorialId],
        ownProps.group.groupId,
        null,
    ),
    tutorial: ownProps.tutorial,
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
