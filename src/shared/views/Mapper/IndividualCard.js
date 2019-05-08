// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import {
    PanResponder,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { toggleMapTile } from '../../actions/index';
import type { Mapper, TaskType } from '../../flow-types';
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
        alignItems: 'flex-end',
        flex: 1,
    },
});

type TRProps = {
    mapper: Mapper,
    row: Array<Tile>,
};

const TileRow = (props: TRProps) => {
    const rows = [];
    const { mapper, row } = props;
    row.forEach((tile) => {
        // inserts empty tiles so that they are always rendered at
        // the same X coordinate on the grid.
        if (tile !== undefined) {
            if (tile === 'emptytile') {
                rows.push(<EmptyTile key={Math.random()} />);
            } else {
                rows.push(<Tile tile={tile} key={tile.taskId} mapper={mapper} />);
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
    onToggleTile: TaskType => void,
};

type ICState = {
    showSwipeHelp: boolean,
};

type PressEvent = {}; // FIXME: figure out the proper type
type PanResponderInstance = PanResponder.PanResponderInstance;
type GestureState = PanResponder.GestureState;

class _IndividualCard extends React.Component<ICProps, ICState> {
    constructor(props: ICProps) {
        super(props);
        // vertical swipe handlers
        this.swipeThreshold = 3;

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onMoveShouldSetPanResponderCapture: this.handleMoveShouldSetPanResponderCapture,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderTerminate,
        });

        this.state = {
            showSwipeHelp: false,
        };
    }

    handleMoveShouldSetPanResponder = (
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => {
        // decide if we handle the move event: only if it's vertical
        console.log('Move', gestureState.dx, gestureState.dy, gestureState.vx, gestureState.vy);
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * this.swipeThreshold;
    };

    handleMoveShouldSetPanResponderCapture = (
        event: PressEvent,
        gestureState: GestureState,
    ): boolean => {
        // decide if we handle the move event: only if it's vertical
        // this captures the swipe from the ScrollView
        console.log('MoveCapture', gestureState.dx, gestureState.dy, gestureState.vx, gestureState.vy);
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * this.swipeThreshold;
    };

    handlePanResponderGrant = (
        event: PressEvent,
        gestureState: GestureState,
    ) => {
        // OK, we've been given this swipe to handle, show feedback to the user
        console.log('Grant', gestureState.numberActiveTouches);
        this.setState({ showSwipeHelp: true });
    };

    handlePanResponderMove = (event: PressEvent, gestureState: GestureState) => {
        // called on each frame while the user's finger is swiping
        console.log('ResponderMove', gestureState.dx, gestureState.dy);
    };

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        const { card, mapper, onToggleTile } = this.props;
        console.log('ResponderEnd', gestureState.dx, gestureState.dy);
        this.setState({ showSwipeHelp: false });
        if (gestureState.dy > GLOBAL.TILE_VIEW_HEIGHT * 1.5) {
            card.tileRows.forEach((row) => {
                row.tiles.forEach((tile) => {
                    onToggleTile({
                        id: tile.id,
                        result: 3,
                        projectId: tile.projectId,
                        wkt: tile.wkt,
                        item: mapper.project.lookFor,
                        device: DeviceInfo.getUniqueID(),
                        user: GLOBAL.DB.getAuth().getUser().uid,
                        timestamp: GLOBAL.DB.getTimestamp(),
                    });
                });
            });
        }
    };

    handlePanResponderTerminate = (event: PressEvent, gestureState: GestureState) => {
        // swipe cancelled, eg: some other component took over (ScrollView?)
        console.log('ResponderTerminate', gestureState);
        this.setState({ showSwipeHelp: false });
    };

    panResponder: PanResponderInstance;

    swipeThreshold: number;

    renderSwipeHelp = () => (
        <Text style={styles.swipeHelp}>
            Swipe down to mark all 6 tiles RED
        </Text>
    )

    render() {
        const rows = [];
        const { card, mapper } = this.props;
        const { showSwipeHelp } = this.state;
        card.tileRows.forEach((row) => {
            rows.unshift(<TileRow key={`${row.cardXStart}:${row.rowYStart}`} mapper={mapper} row={row.tiles} />);
        });

        return (
            <View
                style={styles.slide}
                {...this.panResponder.panHandlers}
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
    }
);

const mapDispatchToProps = dispatch => (
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
