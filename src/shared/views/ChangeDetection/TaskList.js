// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { FlatList } from 'react-native';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
// import TutorialBox from '../../common/Tutorial';
import ChangeDetectionTask from './Task';
import { toggleMapTile } from '../../actions/index';

import type {
    CategoriesType,
    ChangeDetectionGroupType,
    ChangeDetectionTaskType,
    NavigationProp,
    ResultType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

type Props = {
    categories: CategoriesType,
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
        console.log(currentX)

        const { group } = this.props;

        console.log('get xmin: ' + group.xMin)

        const currentScreen = Math.floor((currentX - group.xMin));
        return currentScreen;
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
            // getCurrentScreen returns an incorrect value after the last sample screen
            const currentScreen = Math.round(
                event.nativeEvent.contentOffset.x / GLOBAL.SCREEN_WIDTH -
                    this.tutorialIntroWidth,
            );
            console.log(
                'currentScreen',
                currentScreen,
                this.getCurrentScreen(),
            );
            if (currentScreen >= 0) {
                // we changed page, reset state variables
                // $FlowFixMe
                if (currentScreen >= this.tasksPerScreen.length) {
                    this.scrollEnabled = true;
                } else {
                    this.scrollEnabled = false;
                    this.tapsRegistered = 0; // remember to offset by 1 (see above)
                    this.tapsExpected = this.getNumberOfTapsExpectedForScreen(
                        currentScreen,
                    );
                    this.setState({
                        tutorialMode: tutorialModes.instructions,
                        showAnswerButtonIsVisible: false,
                    });
                }
            };
        }
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
            categories,
            group,
            isSendingResults,
            navigation,
            onToggleTile,
            submitResult,
            tutorial,
        } = this.props;
        if (!group || !group.tasks || isSendingResults) {
            return <LoadingIcon />;
        }

        let tutorialContent: ?TutorialContent;
        if (tutorial && group.tasks) {
            if (currentX >= group.xMax) {
                // we've reached the end, hide the tutorial text
                tutorialContent = undefined;
            } else {
                const currentScreen = this.getCurrentScreen();
                if (currentScreen >= 0) {
                    tutorialContent = screens[currentScreen][tutorialMode];
                } else {
                    tutorialContent = null;
                }
            }
        }

        console.log(tutorialContent)

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
                pagingEnabled
                // eslint-disable-next-line no-return-assign
                ref={(r) => (this.flatlist = r)}
                renderItem={({ item, index }) => (
                    <ChangeDetectionTask
                        categories={categories}
                        index={index}
                        onToggleTile={onToggleTile}
                        submitResult={submitResult}
                        task={item}
                        tutorial={false}
                    />
                )}
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
