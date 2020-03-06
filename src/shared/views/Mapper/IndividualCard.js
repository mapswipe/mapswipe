// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import {
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
import { toggleMapTile } from '../../actions/index';
import type { Mapper, ResultType } from '../../flow-types';
import { EmptyTile, Tile } from './Tile';
import {
    COLOR_DEEP_BLUE,
} from '../../constants';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: COLOR_DEEP_BLUE,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    swipeHelp: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        position: 'absolute',
        top: 50,
        left: 30,
        zIndex: 100,
    },
    tileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 0,
    },
});

type TRProps = {
    mapper: Mapper,
    row: Array<Tile>,
    tutorial: boolean,
};

const TileRow = (props: TRProps) => {
    const rows = [];
    const { mapper, row, tutorial } = props;
    row.forEach((tile) => {
        // inserts empty tiles so that they are always rendered at
        // the same X coordinate on the grid.
        if (tile !== undefined) {
            if (tile === 'emptytile') {
                rows.push(<EmptyTile key={Math.random()} />);
            } else {
                rows.push(<Tile
                    tile={tile}
                    key={tile.taskId}
                    mapper={mapper}
                    tutorial={tutorial}
                />);
            }
        }
    });
    return (
        <View style={styles.tileRow}>
            {rows}
        </View>
    );
};


type ICProps = {
    card: Object,
    mapper: Mapper,
    onToggleTile: ResultType => void,
    tutorial: boolean,
};

type ICState = {
    showSwipeHelp: boolean,
};

class _IndividualCard extends React.Component<ICProps, ICState> {
    panResponder: PanResponderInstance;

    swipeThreshold: number;

    constructor(props: ICProps) {
        super(props);
        // vertical swipe handlers
        this.swipeThreshold = 2;

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onMoveShouldSetPanResponderCapture: this.handleMoveShouldSetPanResponderCapture,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderTerminate,
        });

        this.state = {
            showSwipeHelp: false,
        };
    }

    handleMoveShouldSetPanResponder = (
        // decide if we handle the move event: only if it's vertical
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => {
        console.log('handleMoveShouldSetPanResponder', gestureState.dx, gestureState.dy);
        return Math.abs(gestureState.dy) > 20 + Math.abs(gestureState.dx) * this.swipeThreshold;
    };

    handleMoveShouldSetPanResponderCapture = (
        // decide if we handle the move event: only if it's vertical
        // this captures the swipe from the ScrollView
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => {
        console.log('handleMoveShouldSetPanResponderCapture', gestureState.dx, gestureState.dy);
        return Math.abs(gestureState.dy) > 20 + Math.abs(gestureState.dx) * this.swipeThreshold;
    };

    handlePanResponderGrant = () => {
        // OK, we've been given this swipe to handle, show feedback to the user
        this.setState({ showSwipeHelp: true });
    };

    setAllTilesTo = (value) => {
        const { card, onToggleTile } = this.props;
        card.tileRows.forEach((row) => {
            row.tiles.forEach((tile) => {
                onToggleTile({
                    groupId: tile.groupId,
                    resultId: tile.taskId,
                    result: value,
                    projectId: tile.projectId,
                });
            });
        });
    }

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        this.setState({ showSwipeHelp: false });
        const swipeMinLength = 0.2;
        if (gestureState.dy > GLOBAL.TILE_VIEW_HEIGHT * swipeMinLength) {
            this.setAllTilesTo(3);
        } else if (gestureState.dy < -GLOBAL.TILE_VIEW_HEIGHT * swipeMinLength) {
            this.setAllTilesTo(0);
        }
    };

    handlePanResponderTerminate = () => {
        // swipe cancelled, eg: some other component took over (ScrollView?)
        this.setState({ showSwipeHelp: false });
    };

    renderSwipeHelp = () => (
        <Text style={styles.swipeHelp}>
            Swipe DOWN to mark all 6 tiles RED.
            {'\n'}
            Swipe UP to undo.
        </Text>
    )

    render() {
        const rows = [];
        const { card, mapper, tutorial } = this.props;
        const { showSwipeHelp } = this.state;
        card.tileRows.forEach((row) => {
            rows.unshift(<TileRow
                key={`${row.cardXStart}:${row.rowYStart}`}
                mapper={mapper}
                row={row.tiles}
                tutorial={tutorial}
            />);
        });

        return (
            <View
                style={styles.slide}
                {...this.panResponder.panHandlers}
                testID="individualCard"
            >
                { showSwipeHelp && this.renderSwipeHelp() }
                {rows}
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        card: ownProps.card,
        mapper: ownProps.mapper,
        tutorial: ownProps.tutorial,
    }
);

const mapDispatchToProps = (dispatch) => (
    {
        onToggleTile: (tileInfo) => {
            dispatch(toggleMapTile(tileInfo));
        },
    }
);

// IndividualCard
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(_IndividualCard);
