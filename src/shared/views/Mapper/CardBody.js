// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { FlatList } from 'react-native';
import get from 'lodash.get';
import { toggleMapTile } from '../../actions/index';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import TutorialBox from '../../common/Tutorial';
import ScaleBar from '../../common/ScaleBar';
import IndividualCard from './IndividualCard';
import type {
    BuiltAreaGroupType,
    CategoriesType,
    NavigationProp,
    ResultMapType,
    TaskType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

type Props = {
    categories: CategoriesType,
    closeTilePopup: () => void,
    group: BuiltAreaGroupType,
    navigation: NavigationProp,
    openTilePopup: () => void,
    projectId: number,
    results: ResultMapType,
    tutorial: boolean,
    updateProgress: (number) => void,
    zoomLevel: number,
};

type State = {
    currentX: number,
    showScaleBar: boolean,
    tutorialMode: string,
};

const tutorialModes = {
    pre: 'pre',
    post_correct: 'post_correct',
    post_wrong: 'post_wrong',
};

class _CardBody extends React.Component<Props, State> {
    firstTouch: Object;

    previousTouch: Object;

    scrollEnabled: boolean;

    tasksPerScreen: ?Array<Array<TaskType>>;

    constructor(props: Props) {
        super(props);
        this.scrollEnabled = !props.tutorial;
        this.tasksPerScreen = undefined;
        this.state = {
            currentX: parseInt(props.group.xMin, 10),
            showScaleBar: true,
            tutorialMode: tutorialModes.pre,
        };
    }

    componentDidUpdate = (prevProps: Props) => {
        const { group, updateProgress } = this.props;
        if (prevProps.group.tasks !== group.tasks) {
            if (isLoaded(group.tasks) && !isEmpty(group.tasks)) {
                //this.tasksPerScreen = this.orderTasks();
                updateProgress(0);
            }
        }
    };

    orderTasks = () => {
        // build an array of tasks grouped by 6 so that each
        // item in the array holds all the info for 1 screen
        // this array will then be passed to the FlatList.data prop
        // and each item will be passed to FlatList.renderItem()

        const {
            group: { xMax, xMin, yMin, tasks },
        } = this.props;
        const minx = parseInt(xMin, 10);
        const maxx = parseInt(xMax, 10);
        const miny = parseInt(yMin, 10);
        // screens contains items of 6 elements, organized in columns,
        // sorted by X then Y, so that the first 3 items are 1 column, the
        // next 3 are the next column to the right of it, etc...
        const numScreens = Math.ceil((1 + maxx - minx) / 2);
        const screens = [...Array(numScreens)].map(() => Array(6));

        tasks.forEach((task) => {
            // place the task in the screens array
            const dX = parseInt(task.taskX, 10) - minx;
            const screen = Math.floor(dX / 2);
            const column = dX % 2;
            const row = parseInt(task.taskY, 10) - miny;
            screens[screen][row + 3 * column] = task;
        });
        return screens;
    };

    toNextGroup = () => {
        const { navigation } = this.props;
        navigation.navigate('Mapper');
    };

    handleScroll = (event: Object) => {
        // this event is triggered much more than once during scrolling
        // Updating the progress bar here allows a smooth transition
        const {
            contentOffset: { x },
            contentSize: { width },
        } = event.nativeEvent;
        const { updateProgress } = this.props;
        // FlatList includes the "Load More" screen in the width
        // which we don't want for progress calculation
        const progress = width === 0 ? 0 : x / (width - GLOBAL.SCREEN_WIDTH);
        updateProgress(progress);
        return progress;
    };

    checkTutorialAnswers = () => {
        // only called when running the tutorial
        // compare the user's results with what is expected
        // and set the tutorial mode to correct/wrong for
        // appropriate feedback
        const { group, results } = this.props;
        const { currentX } = this.state;
        const Xs = [currentX, currentX + 1];
        const tilesToCheck = group.tasks.filter((t) =>
            Xs.includes(parseInt(t.taskX, 10)),
        );
        const allCorrect = tilesToCheck.reduce(
            (ok, t) => ok && t.referenceAnswer === results[t.taskId].toString(),
            true,
        );
        if (allCorrect) {
            this.setState({ tutorialMode: tutorialModes.post_correct });
            this.scrollEnabled = true;
        } else {
            this.setState({ tutorialMode: tutorialModes.post_wrong });
        }
    };

    handleTutorialScrollCapture = (event: Object) => {
        // Only used when running the tutorial
        // when scrolling is disabled, determine if the user
        // tried to scroll, and respond accordingly
        const e = event.nativeEvent;
        const { tutorial } = this.props;
        if (tutorial && !this.scrollEnabled) {
            if (
                this.firstTouch === undefined ||
                (e.identifier === this.previousTouch.identifier &&
                    e.timestamp - this.previousTouch.timestamp > 100)
            ) {
                // during a swipe, events are fired at about 15-30ms interval
                // so at more than 100ms interval, we probably have a new touch event
                this.firstTouch = e;
                this.previousTouch = e;
            } else {
                // we're swiping!
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

    onMomentumScrollEnd = (event: Object) => {
        // update the page number for the tutorial
        // we don't do this in handleScroll as each scroll
        // triggers dozens of these events, whereas this happens
        // only once per page
        const {
            group: { xMax, xMin },
            tutorial,
        } = this.props;
        const progress = this.handleScroll(event);
        if (tutorial) {
            // determine current taskX for tutorial
            const min = parseInt(xMin, 10);
            const max = parseInt(xMax, 10);
            this.setState({
                currentX: Math.ceil(min + (max - min) * progress),
            });
            // we changed page, reset state variables
            this.scrollEnabled = false;
            this.setState({ tutorialMode: tutorialModes.pre });
        }
        this.setState({ showScaleBar: progress < 0.99 });
    };

    render() {
        const { currentX, showScaleBar, tutorialMode } = this.state;
        const {
            categories,
            closeTilePopup,
            group,
            navigation,
            openTilePopup,
            projectId,
            tutorial,
            zoomLevel,
        } = this.props;

        let tutorialText: string = '';

        if (group.tasks === undefined) {
            return <LoadingIcon key="loadingicon" />;
        }

        if (tutorial && group.tasks) {
            if (currentX >= group.xMax) {
                // we've reached the end, hide the tutorial text
                tutorialText = '';
            } else {
                const { category } = group.tasks.filter(
                    (t) => parseInt(t.taskX, 10) === currentX,
                )[0];
                // $FlowFixMe see https://stackoverflow.com/a/54010838/1138710
                tutorialText = categories[category][tutorialMode];
            }
        }

        this.tasksPerScreen = this.orderTasks();
        // calculate the latitude of the top row of the group for the scalebar
        // see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        // lat_rad = arctan(sinh(π * (1 - 2 * ytile / n)))
        // lat_deg = lat_rad * 180.0 / π
        const latitude =
            Math.atan(
                Math.sinh(Math.PI * (1 - (2 * group.yMin) / 2 ** zoomLevel)),
            ) *
            (180 / Math.PI);
        return (
            <>
                {/* $FlowFixMe */}
                <FlatList
                    data={this.tasksPerScreen}
                    decelerationRate="fast"
                    disableIntervalMomentum
                    keyExtractor={(screen) => screen[0].taskId}
                    horizontal
                    initialNumToRender={1}
                    ListFooterComponent={
                        <LoadMoreCard
                            group={group}
                            navigation={navigation}
                            projectId={projectId}
                            toNextGroup={this.toNextGroup}
                            tutorial={tutorial}
                        />
                    }
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    onScroll={this.handleScroll}
                    onMoveShouldSetResponderCapture={
                        this.handleTutorialScrollCapture
                    }
                    pagingEnabled
                    renderItem={({ item, index }) => (
                        <IndividualCard
                            card={item}
                            closeTilePopup={closeTilePopup}
                            index={index}
                            openTilePopup={openTilePopup}
                            tutorial={tutorial}
                        />
                    )}
                    scrollEnabled={this.scrollEnabled}
                    snapToInterval={GLOBAL.TILE_SIZE * 2}
                    showsHorizontalScrollIndicator={false}
                />
                <ScaleBar
                    latitude={latitude}
                    visible={showScaleBar}
                    zoomLevel={zoomLevel}
                />
                {tutorial && tutorialText !== '' && (
                    <TutorialBox>{tutorialText}</TutorialBox>
                )}
            </>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onToggleTile: (tileInfo) => {
        dispatch(toggleMapTile(tileInfo));
    },
});

const mapStateToProps = (state, ownProps) => ({
    categories: ownProps.categories,
    group: ownProps.group,
    navigation: ownProps.navigation,
    projectId: ownProps.projectId,
    results: get(
        state.results[ownProps.tutorialName],
        ownProps.group.groupId,
        null,
    ),
    tutorial: ownProps.tutorial,
    zoomLevel: ownProps.zoomLevel,
});

export default compose(
    firebaseConnect((props) => {
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
                            path: `v2/tasks/${props.projectId}/${groupId}`,
                            storeAs: `${prefix}/${props.projectId}/groups/${groupId}/tasks`,
                        },
                    ];
                }
            }
        }
        return [];
    }),
    connect(mapStateToProps, mapDispatchToProps),
)(_CardBody);
