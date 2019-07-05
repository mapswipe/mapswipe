// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import {
    ScrollView,
    StyleSheet,
} from 'react-native';
import { get } from 'lodash';
import { getSqKmForZoomLevelPerTile } from '../../Database';
import { toggleMapTile } from '../../actions/index';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import TutorialBox from '../../common/Tutorial';
import { Tile } from './Tile';
import IndividualCard from './IndividualCard';
import type {
    BuiltAreaGroupType,
    CategoriesType,
    Mapper,
    NavigationProp,
    ResultMapType,
    ResultType,
} from '../../flow-types';
import {
    COLOR_DEEP_BLUE,
} from '../../constants';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: COLOR_DEEP_BLUE,
        position: 'absolute',
        left: 0,
        bottom: 30,
    },
});

type CardToPushType = {
    cardX: number,
    tileRows: Array<Tile>,
    validTiles: number,
};

type Props = {
    categories: CategoriesType,
    group: BuiltAreaGroupType,
    mapper: Mapper,
    navigation: NavigationProp,
    onToggleTile: ResultType => void,
    projectId: number,
    results: ResultMapType,
    tutorial: boolean,
};

type State = {
    cardsInView: Array<CardToPushType>,
    currentX: string,
    marginXOffset: number,
    tutorialMode: string,
};

const tutorialModes = {
    pre: 'pre',
    post_correct: 'post_correct',
    post_wrong: 'post_wrong',
};

class _CardBody extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.scrollEnabled = !props.tutorial;
        this.state = {
            cardsInView: [],
            currentX: props.group.xMin,
            marginXOffset: 0,
            tutorialMode: tutorialModes.pre,
        };
    }

    componentDidUpdate = (prevProps) => {
        const { group, mapper } = this.props;
        if (prevProps.group.tasks !== group.tasks) {
            if (isLoaded(group.tasks) && !isEmpty(group.tasks)) {
                this.generateCards();
                if (mapper.progress) mapper.progress.updateProgress(0);
                if (this.scrollView) {
                    this.scrollView.scrollTo({ x: 0, animated: false });
                }
            }
        }
    }

    generateCards = () => {
        const { group, onToggleTile } = this.props;
        const tilesPerRow = GLOBAL.TILES_PER_VIEW_X;
        const cards = [];

        // iterate over all the tasksI with an interval of the tilesPerRow variable
        const minX = parseFloat(group.xMin);
        const maxX = parseFloat(group.xMax);
        for (let cardX = minX; cardX < maxX; cardX += tilesPerRow) {
            const cardToPush: CardToPushType = {
                cardX,
                tileRows: [],
                validTiles: 0,
            };

            // iterate over Y once and place all X tiles for this Y coordinate in the tile cache.
            const yMin = parseInt(group.yMin, 10);
            const yMax = parseInt(group.yMax, 10);
            for (let tileY = yMax; tileY >= yMin; tileY -= 1) {
                const tileRowObject = {
                    rowYStart: tileY,
                    rowYEnd: tileY,
                    cardXStart: cardX,
                    cardXEnd: cardX,
                    tiles: [],
                };
                const tileMinX = parseInt(cardX, 10);
                const tileMaxX = tileMinX + tilesPerRow;
                for (let tileX = tileMinX; tileX < tileMaxX; tileX += 1) {
                    const taskIdx = group.tasks.findIndex(
                        e => (parseInt(e.taskX, 10) === tileX && parseInt(e.taskY, 10) === tileY),
                    );
                    if (taskIdx > -1) {
                        // we have a valid task for these coordinates
                        cardToPush.validTiles += 1;
                        const tile = group.tasks[taskIdx];
                        tileRowObject.tiles.push(tile);
                        // store a 0 result for each tile
                        onToggleTile({
                            resultId: tile.taskId,
                            result: 0,
                            groupId: tile.groupId,
                            projectId: tile.projectId,
                        });
                    } else {
                        // no task: insert an empty tile marker
                        tileRowObject.tiles.push('emptytile');
                        const tile = group.tasks[taskIdx];
                        // store a BAD_IMAGERY result for tile without image
                        // as it will save the user a few taps
                        onToggleTile({
                            resultId: tile.taskId,
                            result: 3,
                            groupId: tile.groupId,
                            projectId: tile.projectId,
                        });
                    }

                    if (tileY > tileRowObject.rowYEnd) {
                        tileRowObject.rowYEnd = tileY;
                    }
                    if (tileX > tileRowObject.cardXEnd) {
                        tileRowObject.cardXEnd = tileX;
                    }
                }
                cardToPush.tileRows.push(tileRowObject);
            }
            if (cardToPush.validTiles > 0) { // ensure the card has tiles
                cards.push(cardToPush);
            }
        }
        this.setState({
            cardsInView: cards,
        });
    }

    getContributions = (group, results) => {
        const contributionsCount = Object.keys(results).length;
        const addedDistance = group.count * getSqKmForZoomLevelPerTile(group.zoomLevel);
        return { contributionsCount, addedDistance };
    }

    toNextGroup = () => {
        const { navigation } = this.props;
        navigation.navigate('Mapper');
    }

    handleScroll = (event: Object) => {
        // this event is triggered much more than once during scrolling
        // Updating the progress bar here allows a smooth transition
        const { x } = event.nativeEvent.contentOffset;
        const { cardsInView } = this.state;
        const { mapper } = this.props;
        let progress = 0;
        if (cardsInView.length > 0) {
            progress = x / (GLOBAL.SCREEN_WIDTH * cardsInView.length);
        }
        mapper.progress.updateProgress(progress);
        return progress;
    }

    checkTutorialAnswers = () => {
        // only called when running the tutorial
        // compare the user's results with what is expected
        // and set the tutorial mode to correct/wrong for
        // appropriate feedback
        const { group, results } = this.props;
        const { currentX } = this.state;
        const x = parseInt(currentX, 10);
        const Xs = [x, x + 1].map(n => n.toString());
        const tilesToCheck = group.tasks.filter(
            t => Xs.includes(t.taskX),
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
    }

    handleTutorialScrollCapture = (event: Object) => {
        // Only used when running the tutorial
        // when scrolling is disabled, determine if the user
        // tried to scroll, and respond accordingly
        const e = event.nativeEvent;
        const { tutorial } = this.props;
        if (tutorial && !this.scrollEnabled) {
            if (this.firstTouch === undefined
                || (e.identifier === this.previousTouch.identifier
                && e.timestamp - this.previousTouch.timestamp > 100)) {
                // during a swipe, events are fired at about 15-30ms interval
                // so at more than 100ms interval, we probably have a new touch event
                this.firstTouch = e;
                this.previousTouch = e;
            } else {
                // we're swiping!
                const swipeX = e.pageX - this.firstTouch.pageX;
                const swipeY = e.pageY - this.firstTouch.pageY;
                this.previousTouch = e;
                if (-swipeX > GLOBAL.SCREEN_WIDTH * 0.2
                    && -swipeX > 3 * Math.abs(swipeY)) {
                    this.checkTutorialAnswers();
                    // we have a horizontal left swipe, claim this touch
                    return true;
                }
            }
        }
        // we're not interested in this touch, leave it to some other component
        return false;
    }

    onMomentumScrollEnd = (event: Object) => {
        // update the page number for the tutorial
        // we don't do this in handleScroll as each scroll
        // triggers dozens of these events, whereas this happens
        // only once per page
        const { group: { xMax, xMin }, tutorial } = this.props;
        if (tutorial) {
            const progress = this.handleScroll(event);
            // determine current taskX for tutorial
            const min = parseInt(xMin, 10);
            const max = parseInt(xMax, 10);
            this.setState({ currentX: Math.ceil(min + (max - min) * progress).toString() });
            // we changed page, reset state variables
            this.scrollEnabled = false;
            this.setState({ tutorialMode: tutorialModes.pre });
        }
    }

    currentX: number;

    firstTouch: Object;

    previousTouch: Object;

    scrollEnabled: boolean;

    scrollView: ?ScrollView;

    render() {
        const rows = [];
        const {
            cardsInView,
            currentX,
            marginXOffset,
            tutorialMode,
        } = this.state;
        const {
            categories,
            group,
            mapper,
            navigation,
            projectId,
            tutorial,
        } = this.props;

        let tutorialText: string = '';

        if (tutorial && group.tasks) {
            if (currentX === group.xMax) {
                // we've reached the end, hide the tutorial text
                tutorialText = '';
            } else {
                const { category } = group.tasks.filter(t => t.taskX === currentX)[0];
                // $FlowFixMe see https://stackoverflow.com/a/54010838/1138710
                tutorialText = categories[category][tutorialMode];
            }
        }

        if (cardsInView.length > 0) {
            let lastCard = null;
            cardsInView.forEach((card) => {
                lastCard = card;
                rows.push(<IndividualCard
                    key={card.cardX}
                    card={card}
                    mapper={mapper}
                    tutorial={tutorial}
                />);
            });

            rows.push(<LoadMoreCard
                key={lastCard ? lastCard.id / 2 : 0}
                getContributions={this.getContributions}
                group={group}
                navigation={navigation}
                projectId={projectId}
                toNextGroup={this.toNextGroup}
            />); // lastCard.id/2 is random so that it never is the same number
        } else {
            rows.push(<LoadingIcon key="loadingicon" />);
        }

        return (
            <>
                <ScrollView
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    onScroll={this.handleScroll}
                    onMoveShouldSetResponderCapture={this.handleTutorialScrollCapture}
                    automaticallyAdjustContentInsets={false}
                    horizontal
                    ref={(r) => { this.scrollView = r; }}
                    pagingEnabled
                    removeClippedSubviews
                    scrollEnabled={this.scrollEnabled}
                    contentContainerStyle={[styles.wrapper, { paddingHorizontal: marginXOffset }]}
                >
                    {rows}
                </ScrollView>
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

const mapDispatchToProps = dispatch => (
    {
        onToggleTile: (tileInfo) => {
            dispatch(toggleMapTile(tileInfo));
        },
    }
);

const mapStateToProps = (state, ownProps) => (
    {
        categories: ownProps.categories,
        group: ownProps.group,
        mapper: ownProps.mapper,
        navigation: ownProps.navigation,
        projectId: ownProps.projectId,
        results: get(state.results.build_area_tutorial, ownProps.group.groupId, null),
        tutorial: ownProps.tutorial,
    }
);

export default compose(
    firebaseConnect((props) => {
        if (props.group) {
            const { groupId } = props.group;
            const prefix = props.tutorial ? 'tutorial' : 'projects';
            return [
                {
                    type: 'once',
                    path: `tasks/${props.projectId}/${groupId}`,
                    storeAs: `${prefix}/${props.projectId}/groups/${groupId}/tasks`,
                },
            ];
        }
        return [];
    }),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(_CardBody);
