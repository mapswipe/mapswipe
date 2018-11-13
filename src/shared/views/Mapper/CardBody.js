import * as React from 'react';
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

export class TileRow extends React.Component {
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

export default class CardBody extends React.Component {
    resetState = () => {
        this.allCards = {};
        this.totalRenderedCount = -1;
        this.isOfflineGroup = false;
        this.currentGroup = null;
        this.setState({
            cardsInView: [],
            pagingEnabled: this.props.paging,
        });
        this.scrollView.scrollTo({ x: 0, animated: false });
    }

    componentDidMount = () => {
        GLOBAL.DB.getSingleGroup(this.props.data.id).then((data) => {
            this.generateCards(data.group);
        }).catch((error) => {
            console.error('Error in getTasks', error);
        });
    }

    generateCards = (data) => {
        const tilesPerRow = GLOBAL.TILES_PER_VIEW_X;
        this.currentGroup = data.id;
        this.groupXStart = data.xMin;
        this.groupXEnd = data.xMax;

        const key = `project-${data.projectId}-group-${data.id}`;
        this.isOfflineGroup = GLOBAL.DB.isOfflineGroup(key);
        if (this.isOfflineGroup === true) {
            if (this.lastMode !== 'offline') {
                this.lastMode = 'offline';
                MessageBarManager.showAlert({
                    title: 'You are mapping a downloaded group!',
                    message: 'It will work offline! ',
                    alertType: 'info',
                });
            }
        } else if (this.lastMode !== 'online') {
            this.lastMode = 'online';
            MessageBarManager.showAlert({
                title: 'Online Mapping Activated',
                message: 'If you want to map offline, download tasks on the project home.',
                alertType: 'info',
            });
        }

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
                this.totalRenderedCount++;
                this.allCards[cardToPush.cardX] = cardToPush;
                cards.push(cardToPush);
            }
        }
        this.setState({
            cardsInView: cards,
        });
        // when done loading, always go to the beginning
        // this.hanldeCardRender(0);
    }

    constructor(props) {
        super(props);

        this.allCards = {};
        this.groupXStart = -1;
        this.groupXEnd = -1;
        this.totalRenderedCount = -1;
        this.currentGroup = null;
        this.isOfflineGroup = false;
        this.lastMode = ''; // 0 is online mapping, 1 is offline mapping
        this.currentXRenderOffset = 0; // aka the last state
        this.lastState = -1;

        this.state = {
            cardsInView: [],
            pagingEnabled: this.props.paging,
            marginXOffset: 0,
        };
    }

    handleProgress(scrollThroughComplete) {
        if (scrollThroughComplete === this.lastState || scrollThroughComplete % 20 !== 0) {
            return;
        }

        const diff = this.lastState === -1 ? 0 : scrollThroughComplete - this.lastState;

        const renderCount = 5;
        const renderDistance = renderCount * GLOBAL.TILES_PER_VIEW_X;

        const cardDiff = diff / renderDistance;

        // we increase scroll position regardless
        this.currentXRenderOffset += cardDiff; // negative if the diff is negative, so good like this also for backwards
    }

    handleScroll = (event: Object) => {
        this.props.mapper.progress.updateProgress(event, this.totalRenderedCount);
        const { cardsInView } = this.state;
        let progressToReport = 0;
        if (cardsInView.length > 0) {
            progressToReport = Math.ceil(event.nativeEvent.contentOffset.x / (GLOBAL.SCREEN_WIDTH * cardsInView.length) * 100);
        }
        this.handleProgress(progressToReport);
    }

    render() {
        const rows = [];
        const { cardsInView, marginXOffset, pagingEnabled } = this.state;
        if (cardsInView.length > 0) {
            let lastCard = null;

            cardsInView.forEach((card) => {
                lastCard = card;
                rows.push(<IndividualCard key={card.cardX} card={card} mapper={this.props.mapper} />);
            });

            rows.push(<LoadMoreCard
                key={lastCard.id / 2}
                card={lastCard}
                groupInfo={{ group: this.currentGroup, project: this.props.data.id }}
                mapper={this.props.mapper}
            />); // lastCard.id/2 is random so that it never is the same number
        } else {
            this.showingLoader = true;
            rows.push(<LoadingIcon key="loadingicon" />);
        }
        //
        return (
            <ScrollView
                onScroll={this.handleScroll}
                automaticallyAdjustInsets={false}
                horizontal
                ref={(r) => { this.scrollView = r; }}
                pagingEnabled={pagingEnabled}
                removeClippedSubviews
                contentContainerStyle={[styles.wrapper, { paddingHorizontal: marginXOffset }]}
            >
                {rows}
            </ScrollView>
        );
    }
}

