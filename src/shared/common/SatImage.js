import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type {
    ImageStyleProp,
    TextStyleProp,
} from 'react-native/Libraries/StyleSheet/StyleSheet';
import * as Sentry from '@sentry/react-native';
import { Tile } from '../views/ChangeDetection/Tile';
import { type ChangeDetectionTaskType, ResultType } from '../flow-types';

const styles = StyleSheet.create({
    imageBackground: {
        aspectRatio: 1,
        height: '90%',
        //width: '100%',
        //position: 'absolute',
    },
});

type Props = {
    interactive: boolean,
    onToggleTile: ResultType => void,
    overlayText: string,
    overlayTextStyle: TextStyleProp,
    source: Image.ImageSourcePropType,
    style: ImageStyleProp,
    task: ChangeDetectionTaskType,
    closeTilePopup: () => void,
    openTilePopup: () => void,
    hideIcons: boolean,
    visibleAccessibility: boolean,
};

type State = {
    source: string,
};

export default class SatImage extends React.Component<Props, State> {
    static defaultProps = {
        interactive: false,
        onToggleTile: () => null,
        closeTilePopup: () => null,
        openTilePopup: () => null,
    };

    // An image component that works like a standard image, except
    // that it shows a "no image found" icon if the url provided is
    // invalid, or returns something like an HTTP 204 No Content code,
    // which seems quite common with WMS servers.
    constructor(props: Props) {
        super(props);
        this.state = {
            source: props.source,
        };
    }

    componentDidUpdate(prevProps) {
        const { source } = this.props;
        if (prevProps.source.uri !== source.uri) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ source });
        }
    }

    onError = evt => {
        const { source } = this.state;
        const {
            nativeEvent: { error },
        } = evt;
        Sentry.addBreadcrumb({
            message: 'Image not loading',
            data: {
                url: source.uri,
                error,
            },
        });
        Sentry.captureMessage('Cannot load sat imagery', 'warning');
        console.log(error);
        this.setState({
            // eslint-disable-next-line global-require
            source: require('../../../assets/noImageAvailable.png'),
        });
    };

    render() {
        const { source } = this.state;
        const {
            interactive,
            onToggleTile,
            overlayText,
            overlayTextStyle,
            style,
            task,
            openTilePopup,
            closeTilePopup,
            hideIcons,
            visibleAccessibility,
        } = this.props;

        return (
            <View style={style}>
                <Text style={overlayTextStyle}>{overlayText}</Text>
                {interactive ? (
                    <Tile
                        onToggleTile={onToggleTile}
                        results={0}
                        style={styles.imageBackground}
                        tile={task}
                        source={source}
                        tutorial={false}
                        closeTilePopup={closeTilePopup}
                        openTilePopup={openTilePopup}
                        hideIcons={hideIcons}
                        visibleAccessibility={visibleAccessibility}
                    />
                ) : (
                    <Tile
                        style={styles.imageBackground}
                        tile={task}
                        source={source}
                        tutorial={false}
                        closeTilePopup={closeTilePopup}
                        openTilePopup={openTilePopup}
                        hideIcons={hideIcons}
                        visibleAccessibility={visibleAccessibility}
                    />
                )}
            </View>
        );
    }
}
