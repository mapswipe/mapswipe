// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { FlatList } from 'react-native';
import get from 'lodash.get';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import TutorialBox from '../../common/Tutorial';
import { tutorialModes } from '../../constants';
import ShowAnswersButton from '../../common/Tutorial/ShowAnswersButton';
import TutorialEndScreen from '../../common/Tutorial/TutorialEndScreen';
import TutorialOutroScreen from '../../common/Tutorial/TutorialOutro';
import ScaleBar from '../../common/ScaleBar';
import ChangeDetectionTask from './Task';
import { toggleMapTile } from '../../actions/index';

import type {
    ChangeDetectionGroupType,
    ChangeDetectionTaskType,
    NavigationProp,
    ResultMapType,
    ResultType,
    TutorialContent,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

type Props = {
    screens: Array<TutorialContent>,
    group: ChangeDetectionGroupType,
    isSendingResults: boolean,
    navigation: NavigationProp,
    onToggleTile: ResultType => void,
    results: ResultMapType,
    submitResult: (number, string) => void,
    tutorial: boolean,
    updateProgress: number => void,
    closeTilePopup: () => void,
    openTilePopup: () => void,
    zoomLevel: number,
    canContinueMapping: boolean,
    hideIcons: boolean,
    visibleAccessibility: boolean,
};

type State = {
    showAnswerButtonIsVisible: boolean,
    tutorialBoxIsVisible: boolean,
    tutorialMode: $Keys<typeof tutorialModes>,
};

class _ChangeDetectionTaskList extends React.Component<Props, State> {
    flatlist: ?FlatList<ChangeDetectionTaskType>;

    currentX: number;

    currentScreen: number;

    firstTouch: Object;

    previousTouch: Object;

    scrollEnabled: boolean;

    tasksPerScreen: number;

    tutorialIntroWidth: number;

    constructor(props: Props) {
        super(props);
        this.flatlist = null;
        this.scrollEnabled = !props.tutorial;
        this.tasksPerScreen = 1;
        // the number of screens that the initial tutorial intro covers
        this.tutorialIntroWidth = 0;
        this.currentScreen = 0; //- this.tutorialIntroWidth;
        this.currentX = 0;
        this.state = {
            showAnswerButtonIsVisible: false,
            tutorialBoxIsVisible: props.tutorial,
            tutorialMode: tutorialModes.instructions,
        };
    }

    componentDidUpdate = (oldProps: Props) => {
        const { results, tutorial, screens } = this.props;
        const currentScreen = this.getCurrentScreen();
        if (
            tutorial &&
            results &&
            results !== oldProps.results &&
            currentScreen > 0 &&
            currentScreen < screens.length
        ) {
            // we're cheating here: we use the fact that props are updated when the user
            // taps a tile to check the answers, instead of responding to the tap event.
            // This is to avoid having to pass callbacks around all the way down to the tiles.
            // to prevent mistaking prop updates for taps, we check that at least one result
            // is non-zero
            this.checkTutorialAnswers();
        }
    };

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
            ? group.tasks.length * GLOBAL.SCREEN_WIDTH
            : 0;
        // $FlowFixMe
        const progress = width === 0 ? 0 : x / width;
        updateProgress(progress);

        return progress;
    };

    onMomentumScrollEnd = (event: Object) => {
        // update the page number for the tutorial
        // we don't do this in handleScroll as each scroll
        // triggers dozens of these events, whereas this happens
        // only once per page
        const { group, tutorial } = this.props;
        const progress = this.onScroll(event);
        const {
            contentOffset: { x },
        } = event.nativeEvent;

        if (tutorial && group) {
            const totalTasks = group.tasks?.length ?? 0;
            const contentWidth = totalTasks * GLOBAL.SCREEN_WIDTH;

            // width of one item
            const itemWidth = contentWidth / totalTasks;

            // current item index (centered one)
            const currentIndex = Math.round(x / itemWidth);

            // FIXME: currentX is incorrect after xMax because of next line
            this.currentX = currentIndex;
            // getCurrentScreen returns an incorrect value after the last sample screen
            const currentScreen = this.getCurrentScreen();
            if (currentScreen >= 0) {
                // we changed page, reset state variables
                // $FlowFixMe
                this.scrollEnabled = false;
                if (progress >= 1.0 || currentIndex >= totalTasks) {
                    // don't display the tutorial box at the last screen
                    // this is the screen with the button to start real mapping
                    this.scrollEnabled = true;
                    this.setState({
                        tutorialBoxIsVisible: false,
                        showAnswerButtonIsVisible: false,
                    });
                } else {
                    this.setState({
                        tutorialMode: tutorialModes.instructions,
                        tutorialBoxIsVisible: true,
                        showAnswerButtonIsVisible: false,
                    });
                }
            }
        }
    };

    getCurrentScreen = () => {
        // return the screen number for the tutorial examples.
        // The screens before the start of the content are numbered negatively
        // which allows to check whether we're showing an example or not
        const { currentX } = this;
        return currentX ?? 0;
    };

    showAnswers = () => {
        const { onToggleTile, group } = this.props;
        const currentScreen = this.getCurrentScreen();
        // set each tile to its reference value
        // $FlowFixMe

        const { taskId } = group.tasks[currentScreen];
        const { referenceAnswer } = group.tasks[currentScreen];

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
        const { tutorialMode } = this.state;

        if (group.tasks) {
            const currentScreen = this.getCurrentScreen();
            const { referenceAnswer } = group.tasks[currentScreen];
            const { taskId } = group.tasks[currentScreen];
            const answer = parseInt(results[taskId], 10);
            if (answer === referenceAnswer) {
                if (
                    answer === 0 &&
                    tutorialMode === tutorialModes.instructions
                ) {
                    this.scrollEnabled = true;
                    this.setState({
                        tutorialMode: tutorialModes.success,
                        showAnswerButtonIsVisible: false,
                        tutorialBoxIsVisible: true,
                    });
                } else if (
                    answer === 0 &&
                    tutorialMode === tutorialModes.success
                ) {
                    this.scrollEnabled = true;
                    this.setState({
                        tutorialMode: tutorialModes.success,
                        showAnswerButtonIsVisible: false,
                        tutorialBoxIsVisible: true,
                    });
                } else if (tutorialMode === tutorialModes.instructions) {
                    // the user got it on her own
                    this.scrollEnabled = true;
                    this.setState({
                        tutorialMode: tutorialModes.success,
                        showAnswerButtonIsVisible: false,
                        tutorialBoxIsVisible: true,
                    });
                } else {
                    // the user used the show answers button
                    this.scrollEnabled = true;
                    this.setState({
                        tutorialMode: tutorialModes.hint,
                        showAnswerButtonIsVisible: false,
                        tutorialBoxIsVisible: true,
                    });
                }
                return true;
            }
            if (referenceAnswer && answer < referenceAnswer) {
                // the user might still get it right
                // and get to the correct answer
                this.scrollEnabled = false;
                this.setState({ tutorialMode: tutorialModes.instructions });
                return false;
            }
            // the answer was not correct
            // and the
            this.scrollEnabled = false;
            this.setState({
                tutorialMode: tutorialModes.hint,
                showAnswerButtonIsVisible: true,
                tutorialBoxIsVisible: false,
            });
            return false;
        }
        return true;
    };

    handleTutorialScrollCapture = (event: Object) => {
        // Only used when running the tutorial
        // when scrolling is disabled, determine if the user
        // tried to scroll, and respond accordingly
        const e = event.nativeEvent;
        const { tutorial, screens } = this.props;
        const currentScreen = this.getCurrentScreen();
        if (
            tutorial &&
            currentScreen >= 0 &&
            // $FlowFixMe
            currentScreen < screens.length &&
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
        const {
            group,
            isSendingResults,
            navigation,
            onToggleTile,
            submitResult,
            screens,
            tutorial,
            openTilePopup,
            closeTilePopup,
            zoomLevel,
            canContinueMapping,
            hideIcons,
            visibleAccessibility,
        } = this.props;
        const {
            tutorialMode,
            showAnswerButtonIsVisible,
            tutorialBoxIsVisible,
        } = this.state;
        if (!group) {
            return <LoadingIcon label="Loading groups" />;
        }
        if (!group.tasks) {
            return <LoadingIcon label="Loading tasks" />;
        }
        if (isSendingResults) {
            return <LoadingIcon label="Sending results" />;
        }

        const currentScreen = this.getCurrentScreen();
        let tutorialContent: ?TutorialContent;
        if (tutorial && currentScreen < screens.length) {
            // $FlowFixMe see https://stackoverflow.com/a/54010838/1138710
            tutorialContent = screens[currentScreen][tutorialMode];
        }

        let latitude: number;
        if (tutorial) {
            // In tutorial mode we set latitude to the equator.
            // The group.yMin value for the tutorial tasks is not correct.
            latitude = 0.0;
        } else {
            // calculate the latitude of the top row of the group for the scalebar
            // see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
            // lat_rad = arctan(sinh(π * (1 - 2 * ytile / n)))
            // lat_deg = lat_rad * 180.0 / π
            latitude =
                Math.atan(
                    Math.sinh(
                        Math.PI * (1 - (2 * group.yMin) / 2 ** zoomLevel),
                    ),
                ) *
                (180 / Math.PI);
        }

        return (
            <>
                <FlatList
                    style={{
                        height: '100%',
                        width: GLOBAL.SCREEN_WIDTH,
                    }}
                    data={group.tasks}
                    decelerationRate="fast"
                    disableIntervalMomentum
                    keyExtractor={task => task.taskId}
                    horizontal
                    initialNumToRender={1}
                    ListFooterComponent={
                        tutorial ? (
                            <TutorialEndScreen
                                group={group}
                                navigation={navigation}
                                OutroScreen={TutorialOutroScreen}
                                projectId={group.projectId}
                            />
                        ) : (
                            <LoadMoreCard
                                group={group}
                                navigation={navigation}
                                toNextGroup={this.toNextGroup}
                                projectId={group.projectId}
                                tutorial={tutorial}
                                continueMappingButtonVisible={
                                    canContinueMapping
                                }
                            />
                        )
                    }
                    // $FlowFixMe
                    onScroll={this.onScroll}
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    onMoveShouldSetResponderCapture={
                        this.handleTutorialScrollCapture
                    }
                    pagingEnabled
                    // eslint-disable-next-line no-return-assign
                    ref={r => (this.flatlist = r)}
                    renderItem={({ item }) => (
                        <ChangeDetectionTask
                            onToggleTile={onToggleTile}
                            closeTilePopup={closeTilePopup}
                            openTilePopup={openTilePopup}
                            submitResult={submitResult}
                            task={item}
                            hideIcons={hideIcons}
                            visibleAccessibility={visibleAccessibility}
                        />
                    )}
                    scrollEnabled={
                        this.scrollEnabled || this.getCurrentScreen() < 0
                    }
                    snapToInterval={GLOBAL.SCREEN_WIDTH}
                    showsHorizontalScrollIndicator={false}
                />
                <ScaleBar
                    alignToBottom={false}
                    latitude={latitude}
                    position="bottom"
                    referenceSize={GLOBAL.TILE_SIZE}
                    visible
                    zoomLevel={zoomLevel}
                />
                {tutorial && tutorialBoxIsVisible && tutorialContent && (
                    <TutorialBox
                        content={tutorialContent}
                        boxType={tutorialMode}
                        // This is a hack to display the TutorialBox
                        // in the center when loading the tutorial.
                        // We just flipped bottomOffset and topOffset values.
                        bottomOffset="7.5%"
                        topOffset="45%"
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
    zoomLevel: ownProps.zoomLevel,
});

const mapDispatchToProps = dispatch => ({
    onToggleTile: tileInfo => {
        dispatch(toggleMapTile(tileInfo));
    },
});

export default (compose(
    firebaseConnect(props => {
        // wait for the group data to be available in redux-firebase
        if (props.group) {
            const { groupId, projectId } = props.group;
            // $FlowFixMe
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
)(_ChangeDetectionTaskList): any);
