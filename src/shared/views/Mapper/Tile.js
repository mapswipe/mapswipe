/* eslint-disable ft-flow/no-types-missing-file-annotation */
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import base64 from 'base-64';
import {
    ImageBackground,
    View,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
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

const GLOBAL = require('../../Globals');

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
        height: GLOBAL.TILE_SIZE,
        width: GLOBAL.TILE_SIZE,
        backgroundColor: COLOR_DEEP_BLUE,
        borderWidth: 0.5,
        borderTopWidth: 0.5,
        borderColor: COLOR_DARK_GRAY,
    },
    tileStyle: {
        height: GLOBAL.TILE_SIZE,
        width: GLOBAL.TILE_SIZE,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tileOverlay: {
        height: GLOBAL.TILE_SIZE,
        opacity: 0.2,
        width: GLOBAL.TILE_SIZE,
    },
    buildingStyle: {
        height: GLOBAL.TILE_SIZE,
        width: GLOBAL.TILE_SIZE,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        opacity: 0.7,
    },
});

type Props = {
    closeTilePopup: () => void,
    openTilePopup: () => void,
    tile: BuiltAreaTaskType,
    onToggleTile: ResultType => void,
    results: number,
    tutorial: boolean,
    hideIcons: boolean,
    visibleAccessibility: boolean,
};

export class _Tile extends React.Component<Props> {
    tileStatus: number;

    constructor(props: Props) {
        super(props);
        this.tileStatus = 0;
        this.storeResult(props.results);
    }

    // NOTE: now we have to re-render to hide/undide all accessibility icons
    // shouldComponentUpdate(nextProps) {
    //     // the only time the tile needs to be rerendered is when
    //     // its result has changed (after tapping it). All other props
    //     // are fixed for the lifetime of the tile, so we don't need
    //     // to compare them every time RN wants to rerender
    //     const { results } = this.props;
    //     return nextProps.results !== results;
    // }

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

    parseUrlIfItContainsCredentials = rawUrl => {
        // check if we have a basic http auth scheme in the url and
        // send the credentials via headers if so, as react-native's
        // http clients don't seem to support the url scheme.
        const urlPattern =
            /^(?<proto>http|https):\/\/(?<username>.+):(?<password>.+)@(?<url>.+)$/;
        const match = rawUrl.match(urlPattern);
        if (match) {
            const { proto, username, password, url } = match.groups;
            const uri = `${proto}://${url}`;
            return {
                uri,
                headers: {
                    Authorization: `Basic ${base64.encode(
                        `${username}:${password}`,
                    )}`,
                },
            };
        }
        return { uri: rawUrl };
    };

    getImgSource = () => {
        const { tile } = this.props;
        return this.parseUrlIfItContainsCredentials(tile.url);
    };

    getOsmBuildingsUrl = () => {
        const { tile } = this.props;
        if (tile.urlB !== undefined) {
            return this.parseUrlIfItContainsCredentials(tile.urlB);
        }
        return { url: tile.urlB };
    };

    zoomRender = () => {
        const imageSource = this.getImgSource();
        const osmBuildingsImageSource = this.getOsmBuildingsUrl();

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
                >
                    <ImageBackground
                        style={{
                            height: 300,
                            width: 300,
                            borderWidth: 0.5,
                            borderColor: 'rgba(255,255,255,0.2)',
                            opacity: 0.7,
                        }}
                        source={osmBuildingsImageSource}
                    />
                </ImageBackground>
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
            tile: { taskId },
            tutorial,
            hideIcons,
            visibleAccessibility,
        } = this.props;

        const tileStatus = results;
        const overlayColor = this.getTileColor(tileStatus);
        let animatedRows = null;
        const showAnim = Math.floor(Math.random() * 5);

        if (tileStatus > 1 && showAnim === 1 && !tutorial) {
            animatedRows = (
                <Animatable.Text
                    key={`anim-${taskId}`}
                    animation={this.getFunText()[0]}
                    style={styles.animatedText}
                >
                    {this.getFunText()[1]}
                </Animatable.Text>
            );
        }
        const imageSource = this.getImgSource();
        const tapIcon = this.renderTapIcon();
        const hideAccessibilityIconsOnly = hideIcons || !visibleAccessibility;

        let comp;

        if (this.getOsmBuildingsUrl() !== undefined) {
            comp = (
                <ImageBackground
                    style={styles.buildingStyle}
                    source={this.getOsmBuildingsUrl()}
                >
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
            );
        } else {
            comp = (
                <View style={styles.tileStyle} key={`view-${taskId}`}>
                    {animatedRows}
                </View>
            );
        }

        return (
            <TouchableHighlight
                onPress={this.onPressButton}
                onLongPress={this.onLongPress}
                testID="tile"
            >
                <ImageBackground
                    style={styles.tileStyle}
                    key={`touch-${taskId}`}
                    source={imageSource}
                >
                    {hideAccessibilityIconsOnly ? null : tapIcon}
                    {comp}
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
