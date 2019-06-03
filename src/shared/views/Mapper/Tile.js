// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    ImageBackground,
    View,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { toggleMapTile } from '../../actions/index';
import {
    COLOR_LIGHT_GRAY,
} from '../../constants';
import type {
    Mapper,
    ResultType,
    BuiltAreaTaskType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

const tileHeight = GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_Y);
const tileWidth = GLOBAL.SCREEN_WIDTH * (1 / GLOBAL.TILES_PER_VIEW_X);

const styles = StyleSheet.create({
    animatedText: {
        fontWeight: '900',
        fontSize: 20,
        color: '#BBF1FF',
        textAlign: 'center',
        marginTop: 50,
        backgroundColor: 'transparent',
    },
    emptyTile: {
        width: (GLOBAL.SCREEN_WIDTH * (1 / 2)),
        backgroundColor: COLOR_LIGHT_GRAY,
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: '#212121',
    },
    tileStyle: {
        height: tileHeight,
        width: tileWidth,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    tileOverlay: {
        height: tileHeight,
        width: tileWidth,
    },
});

type Props = {
    tile: BuiltAreaTaskType,
    mapper: Mapper,
    onToggleTile: ResultType => void,
    results: number,
};

export class _Tile extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.tileStatus = 0;
        this.lastReportedStatus = -1;
    }

    shouldComponentUpdate(nextProps: Props) {
        const { results } = this.props;
        return (results !== nextProps.results);
    }

    getTileColor = (status: number) => {
        const colors = [
            'rgba(255,255,255,0.0)',
            'rgba(36, 219, 26, 0.2)',
            'rgba(237, 209, 28, 0.2)',
            'rgba(230, 28, 28, 0.2)',
        ];
        return colors[status];
    }

    onPressButton = () => {
        // called when a tile is tapped
        const {
            mapper,
            onToggleTile,
            results,
            tile: { taskId, projectId, groupId },
        } = this.props;
        mapper.closeTilePopup();
        // find the tile status from redux results
        let tileStatus = results;
        tileStatus = (tileStatus + 1) % 4;
        onToggleTile({
            resultId: taskId,
            result: tileStatus,
            groupId,
            projectId,
        });
    }

    onDismissZoom = () => {
        const { mapper } = this.props;
        mapper.closeTilePopup();
    }

    onLongPress = () => {
        const { mapper } = this.props;
        mapper.openTilePopup(this.zoomRender());
    }

    /**
     * Returns the ["animation", "text", duration] for the fun text displayed when you map a tile!
     */
    // eslint-disable-next-line class-methods-use-this
    getFunText() {
        const texts = [
            ['bounceIn', 'Great Job!', '1000'],
            ['bounceIn', 'With every tap you help put a family on the map', '3000'],
            ['bounceIn', 'Thank you!', '1000'],
            ['bounceIn', 'Your effort is helping!', '1000'],
            ['bounceIn', 'Keep up the good work!', '1000'],
        ];

        const random = Math.floor(Math.random() * texts.length);
        return texts[random];
    }

    getImgSource = () => {
        const { tile } = this.props;
        return { uri: tile.url };
    }

    zoomRender = () => {
        const imageSource = this.getImgSource();
        return (
            <TouchableHighlight onPress={this.onDismissZoom}>
                <ImageBackground
                    style={{
                        height: 300,
                        width: 300,
                        borderWidth: 0.5,
                        borderColor: 'rgba(255,255,255,0.2)',
                    }}
                    source={imageSource}
                />
            </TouchableHighlight>
        );
    }

    tileStatus: number;

    lastReportedStatus: number;

    render() {
        const { results, tile: { taskId } } = this.props;
        const tileStatus = results;
        const overlayColor = this.getTileColor(tileStatus);
        const animatedRows = [];
        const showAnim = Math.floor(Math.random() * 5);

        if (tileStatus > 1 && showAnim === 1) {
            animatedRows.push(
                <Animatable.Text
                    key={`anim-${taskId}`}
                    animation={this.getFunText()[0]}
                    style={styles.animatedText}
                >
                    {this.getFunText()[1]}
                </Animatable.Text>,
            );
        }
        const imageSource = this.getImgSource();

        return (
            <TouchableHighlight
                onPress={this.onPressButton}
                onLongPress={this.onLongPress}
            >
                <ImageBackground
                    style={styles.tileStyle}
                    key={`touch-${taskId}`}
                    source={imageSource}
                >
                    <View style={[styles.tileOverlay, { backgroundColor: overlayColor }]} key={`view-${taskId}`}>
                        {animatedRows}
                    </View>
                </ImageBackground>
            </TouchableHighlight>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    // here we plug only the relevant part of the redux state
    // into the component, this helps limit the rerendering of
    // Tiles to only the one that was just tapped.
    let results = 0;
    const { groupId, projectId, taskId } = ownProps.tile;
    // we need this ugly if ()... because the first rendering of the screen
    // happens before initial results have been generated in redux by
    // generateCards
    if (state.results[projectId]
        && state.results[projectId][groupId]
        && state.results[projectId][groupId][taskId]) {
        results = state.results[projectId][groupId][taskId];
    }
    return {
        mapper: ownProps.mapper,
        results,
        tile: ownProps.tile,
    };
};

const mapDispatchToProps = dispatch => (
    {
        onToggleTile: (tileInfo) => {
            dispatch(toggleMapTile(tileInfo));
        },
    }
);

export const Tile = compose(
    firebaseConnect(() => [
    ]),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(_Tile);
export const EmptyTile = () => (<View style={styles.emptyTile} />);
