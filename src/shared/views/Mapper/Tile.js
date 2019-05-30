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
        backgroundColor: '#e8e8e8',
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
    results: BuiltAreaTaskType,
};

export class _Tile extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.tileStatus = 0;
        this.lastReportedStatus = -1;
    }

    shouldComponentUpdate(nextProps: Props) {
        const { results, tile } = this.props;
        return (results[tile.taskId] !== nextProps.results[tile.taskId]);
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
        const {
            mapper,
            onToggleTile,
            results,
            tile,
        } = this.props;
        mapper.closeTilePopup();
        let tileStatus = results[tile.taskId] ? results[tile.taskId].result : 0;
        tileStatus = (tileStatus + 1) % 4;
        onToggleTile({
            resultId: tile.taskId,
            result: tileStatus,
            groupId: tile.groupId,
            projectId: tile.projectId,
            timestamp: GLOBAL.DB.getTimestamp(),
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
        const { results, tile } = this.props;
        const tileStatus = results[tile.taskId] ? results[tile.taskId].result : 0;
        const overlayColor = this.getTileColor(tileStatus);
        const animatedRows = [];
        const showAnim = Math.floor(Math.random() * 5);

        if (tileStatus > 1 && showAnim === 1) {
            animatedRows.push(
                <Animatable.Text
                    key={`anim-${tile.taskId}`}
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
                    key={`touch-${tile.taskId}`}
                    source={imageSource}
                >
                    <View style={[styles.tileOverlay, { backgroundColor: overlayColor }]} key={`view-${tile.taskId}`}>
                        {animatedRows}
                    </View>
                </ImageBackground>
            </TouchableHighlight>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        group: state.firebase.data.group,
        navigation: ownProps.navigation,
        projectId: ownProps.projectId,
        results: state.results,
        tile: ownProps.tile,
    }
);

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
