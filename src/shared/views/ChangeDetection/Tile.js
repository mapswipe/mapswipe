import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    ImageBackground,
    Image,
    View,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { toggleMapTile } from '../../actions/index';
import {
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_TRANSPARENT,
    COLOR_YELLOW,
} from '../../constants';
import type { ResultType, BuiltAreaTaskType } from '../../flow-types';
import {
    NewNumberedTapIconTile1,
    NewNumberedTapIconTile2,
    NewNumberedTapIconTile3,
} from '../../common/Tutorial/icons';

const styles = StyleSheet.create({
    animatedText: {
        fontWeight: '900',
        fontSize: 20,
        color: '#BBF1FF',
        textAlign: 'center',
        marginTop: 50,
        backgroundColor: COLOR_TRANSPARENT,
    },
    emptyTile: {
        backgroundColor: COLOR_DEEP_BLUE,
        borderWidth: 0.5,
        borderTopWidth: 0.5,
        borderColor: COLOR_DARK_GRAY,
    },
    tileStyle: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tileOverlay: {
        opacity: 0.3,
        aspectRatio: 1,
    },
});
const GLOBAL = require('../../Globals');

type Props = {
    tile: BuiltAreaTaskType,
    onToggleTile: ResultType => void,
    results: number,
    style: ViewStyleProp,
    source: Image.ImageSourcePropType,
    tutorial: boolean,
    closeTilePopup: () => void,
    openTilePopup: () => void,
    hideIcons: boolean,
    visibleAccessibility: boolean,
};

export class _Tile extends React.PureComponent<Props> {
    tileStatus: number;

    lastReportedStatus: number;

    constructor(props: Props) {
        super(props);
        this.tileStatus = 0;
        this.lastReportedStatus = -1;
        this.storeResult(props.results);
    }

    getTileColor = (status: number) => {
        const colors = [
            COLOR_TRANSPARENT,
            COLOR_GREEN,
            COLOR_YELLOW,
            COLOR_RED,
        ];
        return colors[status];
    };

    onPressButton = () => {
        // called when a tile is tapped
        const { closeTilePopup, results } = this.props;
        closeTilePopup();
        // find the tile status from redux results
        let tileStatus = results;
        tileStatus = (tileStatus + 1) % 4;
        this.storeResult(tileStatus);
    };

    onDismissZoom = () => {
        const { closeTilePopup } = this.props;
        closeTilePopup();
    };

    onLongPress = () => {
        const { openTilePopup } = this.props;
        openTilePopup(this.zoomRender());
    };

    /**
     * Returns the ["animation", "text", duration] for the fun text displayed when you map a tile!
     */
    // eslint-disable-next-line class-methods-use-this
    getFunText() {
        const texts = [
            ['bounceIn', 'Great Job!', '1000'],
            [
                'bounceIn',
                'With every tap you help put a family on the map',
                '3000',
            ],
            ['bounceIn', 'Thank you!', '1000'],
            ['bounceIn', 'Your effort is helping!', '1000'],
            ['bounceIn', 'Keep up the good work!', '1000'],
        ];

        const random = Math.floor(Math.random() * texts.length);
        return texts[random];
    }

    storeResult = result => {
        const {
            onToggleTile,
            tile: { taskId, projectId, groupId },
        } = this.props;
        onToggleTile({
            resultId: taskId,
            result,
            groupId,
            projectId,
        });
    };

    getImgSource = () => {
        const { source } = this.props;
        return { uri: source.uri };
    };

    zoomRender = () => {
        const imageSource = this.getImgSource();
        return (
            <TouchableHighlight onPress={this.onDismissZoom}>
                <ImageBackground
                    style={{
                        // the popped up tile almost entirely fills the screen
                        height: 0.95 * GLOBAL.SCREEN_WIDTH,
                        width: 0.95 * GLOBAL.SCREEN_WIDTH,
                    }}
                    source={imageSource}
                />
            </TouchableHighlight>
        );
    };

    renderTapIcon = () => {
        const { results } = this.props;
        const tileStatus = results;

        if (tileStatus === 1) {
            return <NewNumberedTapIconTile1 />;
        }
        if (tileStatus === 2) {
            return <NewNumberedTapIconTile2 />;
        }
        if (tileStatus === 3) {
            return <NewNumberedTapIconTile3 />;
        }
        return null;
    };

    render() {
        const {
            results,
            style,
            tile: { taskId },
            tutorial,
            hideIcons,
            visibleAccessibility,
        } = this.props;
        const tileStatus = results;
        const overlayColor = this.getTileColor(tileStatus);
        const animatedRows = [];
        const showAnim = Math.floor(Math.random() * 5);

        if (tileStatus > 1 && showAnim === 1 && !tutorial) {
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
        const tapIcon = this.renderTapIcon();
        const hideAccessibilityIconsOnly = hideIcons || !visibleAccessibility;

        return (
            <TouchableHighlight
                onPress={this.onPressButton}
                onLongPress={this.onLongPress}
                testID="tile"
                style={style}
            >
                <ImageBackground
                    style={styles.tileStyle}
                    key={`touch-${taskId}`}
                    source={imageSource}
                >
                    {hideAccessibilityIconsOnly ? null : tapIcon}
                    <View
                        style={[
                            styles.tileOverlay,
                            {
                                backgroundColor: hideIcons
                                    ? undefined
                                    : overlayColor,
                            },
                        ]}
                        key={`view-${taskId}`}
                    >
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
    if (
        state.results[projectId] &&
        state.results[projectId][groupId] &&
        state.results[projectId][groupId][taskId]
    ) {
        results = state.results[projectId][groupId][taskId];
    }
    return {
        closeTilePopup: ownProps.closeTilePopup,
        openTilePopup: ownProps.openTilePopup,
        results,
        tile: ownProps.tile,
        tutorial: ownProps,
    };
};

const mapDispatchToProps = dispatch => ({
    onToggleTile: tileInfo => {
        dispatch(toggleMapTile(tileInfo));
    },
});

export const Tile = compose(
    firebaseConnect(() => []),
    connect(mapStateToProps, mapDispatchToProps),
)(_Tile);
export const EmptyTile = () => <View style={styles.emptyTile} />;
