import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import {
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { MessageBarManager } from 'react-native-message-bar';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from './LoadMore';
import { EmptyTile, Tile } from './Tile';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    slide: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT),
        flex: 1,
        borderWidth: 0,
        backgroundColor: '#212121',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    tileRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,
    },
    wrapper: {
        flex: 1,
        backgroundColor: '#0d1949',
        position: 'absolute',
        left: 0,
        bottom: 30,
    },
});

class IndividualCard extends React.Component {
    render() {
        const rows = [];
        this.props.card.tileRows.forEach((row) => {
            rows.unshift(<TileRow key={`${row.cardXStart}:${row.rowYStart}`} mapper={this.props.mapper} row={row.tiles} />);
        });

        return (
            <View style={styles.slide}>
                {rows}
            </View>
        );
    }
}

class TileRow extends React.Component {
    render() {
        const rows = [];
        const { mapper } = this.props;
        this.props.row.forEach((tile) => {
            // inserts empty tiles so that they are always rendered at
            // the same X coordinate on the grid.
            if (tile !== undefined) {
                if (tile === 'emptytile') {
                    rows.push(<EmptyTile key={Math.random()} />);
                } else {
                    rows.push(<Tile data={tile} key={tile.id} mapper={mapper} />);
                }
            }
        });
        return (
            <View style={styles.tileRow}>
                {rows}
            </View>
        );
    }
}

class _CardBody extends React.Component {
    constructor(props) {
        super(props);
        this.currentGroup = null;
        this.isOfflineGroup = false;
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
        if (prevProps.group !== group) {
            if (isLoaded(group) && !isEmpty(group)) {
                this.generateCards();
                mapper.progress.updateProgress(0);
                this.scrollView.scrollTo({ x: 0, animated: false });
            }
        }
    }

    generateCards = () => {
        const { group } = this.props;
        const groupId = Object.keys(group)[0];
        const data = group[groupId];
        const tilesPerRow = GLOBAL.TILES_PER_VIEW_X;
        this.currentGroup = data.id;
        const cards = [];

        // iterate over all the tasksI with an interval of the tilesPerRow variable
        for (let cardX = parseFloat(data.xMin); cardX < parseFloat(data.xMax); cardX += tilesPerRow) {
            const cardToPush = {
                cardX,
                tileRows: [],
                validTiles: 0,
            };

            // iterate over Y once and place all X tiles for this Y coordinate in the tile cache.
            for (let tileY = parseFloat(data.yMax); tileY >= parseFloat(data.yMin); tileY -= 1) {
                const tileRowObject = {
                    rowYStart: tileY,
                    rowYEnd: tileY,
                    cardXStart: cardX,
                    cardXEnd: cardX,
                    tiles: [],
                };
                for (let tileX = parseFloat(cardX); tileX < parseFloat(cardX) + tilesPerRow; tileX += 1) {
                    if (data.tasks[`${data.zoomLevel}-${tileX}-${tileY}`] !== undefined) {
                        cardToPush.validTiles++;
                    }
                    tileRowObject.tiles.push(
                        data.tasks[`${data.zoomLevel}-${tileX}-${tileY}`] === undefined ? 'emptytile' : data.tasks[`${data.zoomLevel}-${tileX}-${tileY}`],
                    );

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

    render() {
        const rows = [];
        const { cardsInView, marginXOffset } = this.state;
        const {
            group,
            mapper,
            navigation,
            projectId
        } = this.props;
        if (cardsInView.length > 0) {
            let lastCard = null;

            cardsInView.forEach((card) => {
                lastCard = card;
                rows.push(<IndividualCard key={card.cardX} card={card} mapper={mapper} />);
            });

            rows.push(<LoadMoreCard
                key={lastCard.id / 2}
                card={lastCard}
                group={group[Object.keys(group)[0]]}
                groupId={this.currentGroup}
                mapper={mapper}
                navigation={navigation}
                projectId={projectId}
            />); // lastCard.id/2 is random so that it never is the same number
        } else {
            this.showingLoader = true;
            rows.push(<LoadingIcon key="loadingicon" />);
        }

        return (
            <ScrollView
                onScroll={this.handleScroll}
                automaticallyAdjustInsets={false}
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

const mapStateToProps = (state, ownProps) => (
    {
        group: state.firebase.data.group,
        mapper: ownProps.mapper,
        navigation: ownProps.navigation,
        projectId: ownProps.projectId,
    }
);

export default compose(
    firebaseConnect(props => [
        {
            path: `groups/${props.projectId}`,
            queryParams: ['limitToFirst=1', 'orderByChild=completedCount'],
            storeAs: 'group',
        },
    ]),
    connect(
        mapStateToProps,
    ),
)(_CardBody);
