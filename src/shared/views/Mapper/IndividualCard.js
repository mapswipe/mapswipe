// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { type PressEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import type {
    GestureState,
    PanResponderInstance,
} from 'react-native/Libraries/Interaction/PanResponder';
import { withTranslation } from 'react-i18next';
import { toggleMapTile } from '../../actions/index';
import type {
    BuiltAreaTaskType,
    ResultType,
    TranslationFunction,
} from '../../flow-types';
import { Tile } from './Tile';
import { COLOR_DEEP_BLUE } from '../../constants';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: COLOR_DEEP_BLUE,
        justifyContent: 'center',
        flexDirection: 'column',
        flexWrap: 'wrap',
        // prevent tiles from displaying on 4 rows
        maxHeight: GLOBAL.TILE_SIZE * 4 - 1,
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
});

type ICProps = {
    card: Array<BuiltAreaTaskType>,
    closeTilePopup: () => void,
    onToggleTile: (ResultType) => void,
    openTilePopup: () => void,
    t: TranslationFunction,
    tutorial: boolean,
};

type ICState = {
    showSwipeHelp: boolean,
};

class _IndividualCard extends React.Component<ICProps, ICState> {
    panResponder: PanResponderInstance;

    swipeAngle: number;

    swipeThreshold: number;

    constructor(props: ICProps) {
        super(props);
        // swipeThreshold defines how much movement is needed to start considering the event
        // as a swipe. This used to be a fixed value, we now link it to screen size (through the tile size)
        // so that it should work across screen densities.
        this.swipeThreshold = GLOBAL.TILE_SIZE * 0.02;
        // swipeAngle is not exactly correctly named. It refers to how wide the cone is from starting
        // the swipe, which allows it to be considered a vertical swipe. Higher numbers mean the swipe
        // must be more "vertical", and lower ones are more tolerant, so make it easier to activate the
        // vertical swipe move.
        this.swipeAngle = 0.5;

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onMoveShouldSetPanResponderCapture: this
                .handleMoveShouldSetPanResponder,
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
    ): boolean =>
        Math.abs(gestureState.dy) >
        this.swipeThreshold + Math.abs(gestureState.dx) * this.swipeAngle;

    handlePanResponderGrant = () => {
        // OK, we've been given this swipe to handle, show feedback to the user
        this.setState({ showSwipeHelp: true });
    };

    setAllTilesTo = (value) => {
        const { card, onToggleTile } = this.props;
        card.forEach((tile) => {
            onToggleTile({
                groupId: tile.groupId,
                resultId: tile.taskId,
                result: value,
                projectId: tile.projectId,
            });
        });
    };

    handlePanResponderEnd = (event: PressEvent, gestureState: GestureState) => {
        // swipe completed, decide what to do
        this.setState({ showSwipeHelp: false });
        const swipeMinLength = 0.2;
        if (gestureState.dy > GLOBAL.TILE_VIEW_HEIGHT * swipeMinLength) {
            this.setAllTilesTo(3);
        } else if (
            gestureState.dy <
            -GLOBAL.TILE_VIEW_HEIGHT * swipeMinLength
        ) {
            this.setAllTilesTo(0);
        }
    };

    handlePanResponderTerminate = () => {
        // swipe cancelled, eg: some other component took over (ScrollView?)
        this.setState({ showSwipeHelp: false });
    };

    renderSwipeHelp = () => {
        const { t } = this.props;
        return (
            <Text style={styles.swipeHelp}>
                {t('swipe down mark red')}
                {'\n'}
                {t('swipe up undo')}
            </Text>
        );
    };

    render() {
        const { card, closeTilePopup, openTilePopup, tutorial } = this.props;
        const { showSwipeHelp } = this.state;

        const tiles = [];
        card.forEach((tile) => {
            tiles.push(
                <Tile
                    closeTilePopup={closeTilePopup}
                    key={tile.taskId}
                    openTilePopup={openTilePopup}
                    tile={tile}
                    tutorial={tutorial}
                />,
            );
        });
        return (
            <View
                style={styles.slide}
                {...this.panResponder.panHandlers}
                testID="individualCard"
            >
                {showSwipeHelp && this.renderSwipeHelp()}
                {tiles}
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    card: ownProps.card,
    tutorial: ownProps.tutorial,
});

const mapDispatchToProps = (dispatch) => ({
    onToggleTile: (tileInfo) => {
        dispatch(toggleMapTile(tileInfo));
    },
});

// IndividualCard
export default withTranslation('IndividualCard')(
    connect(mapStateToProps, mapDispatchToProps)(_IndividualCard),
);
