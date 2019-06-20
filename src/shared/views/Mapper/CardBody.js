// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import {
    ScrollView,
    StyleSheet,
} from 'react-native';

import { getSqKmForZoomLevelPerTile } from '../../Database';
import { toggleMapTile } from '../../actions/index';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import { Tile } from './Tile';
import IndividualCard from './IndividualCard';
import type {
    BuiltAreaGroupType,
    Mapper,
    NavigationProp,
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
    group: BuiltAreaGroupType,
    mapper: Mapper,
    navigation: NavigationProp,
    onToggleTile: ResultType => void,
    projectId: number,
};

type State = {
    cardsInView: Array<CardToPushType>,
    marginXOffset: number,
};

class _CardBody extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.lastMode = ''; // 0 is online mapping, 1 is offline mapping
        this.currentXRenderOffset = 0; // aka the last state
        this.lastState = -1;

        this.state = {
            cardsInView: [],
            marginXOffset: 0,
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
        const { x } = event.nativeEvent.contentOffset;
        const { cardsInView } = this.state;
        const { mapper } = this.props;
        let progress = 0;
        if (cardsInView.length > 0) {
            progress = x / (GLOBAL.SCREEN_WIDTH * cardsInView.length);
        }
        mapper.progress.updateProgress(progress);
    }

    currentXRenderOffset: number;

    lastMode: string;

    lastState: number;

    scrollView: ?ScrollView;

    render() {
        const rows = [];
        const { cardsInView, marginXOffset } = this.state;
        const {
            group,
            mapper,
            navigation,
            projectId,
        } = this.props;
        if (cardsInView.length > 0) {
            let lastCard = null;

            cardsInView.forEach((card) => {
                lastCard = card;
                rows.push(<IndividualCard key={card.cardX} card={card} mapper={mapper} />);
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
            <ScrollView
                onScroll={this.handleScroll}
                automaticallyAdjustContentInsets={false}
                horizontal
                ref={(r) => { this.scrollView = r; }}
                pagingEnabled
                removeClippedSubviews
                contentContainerStyle={[styles.wrapper, { paddingHorizontal: marginXOffset }]}
            >
                {rows}
            </ScrollView>
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
        group: ownProps.group,
        mapper: ownProps.mapper,
        navigation: ownProps.navigation,
        projectId: ownProps.projectId,
    }
);

export default compose(
    firebaseConnect((props) => {
        if (props.group) {
            const { groupId } = props.group;
            return [
                {
                    type: 'once',
                    path: `tasks/${props.projectId}/${groupId}`,
                    storeAs: `projects/${props.projectId}/groups/${groupId}/tasks`,
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
