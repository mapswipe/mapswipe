// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    ImageBackground,
    View,
    StyleSheet,
    Image,
    TouchableHighlight,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import DeviceInfo from 'react-native-device-info';
import { toggleMapTile } from '../../actions/index';
import type { TaskType } from '../../flow-types';

const GLOBAL = require('../../Globals');

const tileHeight = GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_Y);
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
});

type Props = {
    tile: Object,
    mapper: Object,
    onToggleTile: TaskType => void,
};

type State = {
    tileOverlay: Object,
};

export class _Tile extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.tileStatus = 0;
        this.lastReportedStatus = -1;
        this.state = {
            tileOverlay: {
                backgroundColor: this.getEdgeColor(),
                height: tileHeight,
                width: tileWidth,
            },
        };
    }

    getEdgeColor = () => {
        switch (this.tileStatus) {
        case 0: {
            return 'rgba(255,255,255,0.0)';
        }
        case 1: {
            return 'rgba(36, 219, 26, 0.2)';
        }
        case 2: {
            return 'rgba(237, 209, 28, 0.2)';
        }
        case 3: {
            return 'rgba(230, 28, 28, 0.2)';
        }
        default: {
            return '#212121';
        }
        }
    }

    onPressButton = () => {
        const { mapper } = this.props;
        mapper.closeTilePopup();
        this.tileStatus = this.tileStatus + 1;
        if (this.tileStatus > 3) {
            this.tileStatus = 0;
        }
        this.setState({
            tileOverlay: {
                backgroundColor: this.getEdgeColor(),
                height: tileHeight,
                width: tileWidth,
            },
        });
        this.checkToReport();
    }

    onLongPress = () => {
        const { mapper } = this.props;
        mapper.openTilePopup(this.zoomRender());
    }

    onLongPressOut = () => {
        const { mapper } = this.props;
        mapper.closeTilePopup();
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

    checkToReport = () => {
        const { mapper, onToggleTile, tile } = this.props;
        if (this.tileStatus !== this.lastReportedStatus) {
            this.lastReportedStatus = this.tileStatus;
            const task = {
                id: tile.id,
                result: this.tileStatus,
                projectId: tile.projectId,
                wkt: tile.wkt,
                item: mapper.project.lookFor,
                device: DeviceInfo.getUniqueID(),
                user: GLOBAL.DB.getAuth().getUser().uid,
                timestamp: GLOBAL.DB.getTimestamp(),
            };
            onToggleTile(task);
        }
    }

    getImgSource = () => {
        const { tile } = this.props;
        return { uri: tile.url };
    }

    zoomRender = () => {
        const imageSource = this.getImgSource();
        return (
            <Image
                style={{
                    height: 300,
                    width: 300,
                    borderWidth: 0.5,
                    borderColor: 'rgba(255,255,255,0.2)',
                }}
                source={imageSource}
            />
        );
    }

    tileStatus: number;

    lastReportedStatus: number;

    render() {
        const { tile } = this.props;
        const { tileOverlay } = this.state;
        const animatedRows = [];
        const showAnim = Math.floor(Math.random() * 5);

        if (this.tileStatus === 1 && showAnim === 1) {
            animatedRows.push(
                <Animatable.Text
                    key={`anim-${tile.id}`}
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
                onPressOut={this.onLongPressOut}
            >
                <ImageBackground
                    style={styles.tileStyle}
                    key={`touch-${tile.id}`}
                    source={imageSource}
                >
                    <View style={tileOverlay} key={`view-${tile.id}`}>
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
