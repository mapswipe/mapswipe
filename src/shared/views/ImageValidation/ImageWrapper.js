import React, { Component } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
// import Svg, { Rect } from 'react-native-svg';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    container: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        width: GLOBAL.SCREEN_WIDTH,
        height: '100%',
    },
    image: {
        width: '100%',
        aspectRatio: 1, // or use real aspect ratio if known
        resizeMode: 'contain',
    },
    loader: {
        position: 'absolute',
        zIndex: 1,
    },
    retryContainer: {
        alignItems: 'center',
    },
    retryText: {
        color: 'white',
        fontSize: 16,
        marginTop: 10,
    },
});

/*
const bboxSample = [408.5, 11.96, 97.67, 276.61];

function calculateBbox(imageDimensions, bbox) {
    if (!imageDimensions || !bbox) {
        return undefined;
    }
    if (
        !imageDimensions.naturalHeight
        || !imageDimensions.naturalWidth
        || !imageDimensions.clientHeight
        || !imageDimensions.clientWidth
    ) {
        return undefined;
    }
    const { naturalHeight, naturalWidth, clientHeight, clientWidth } =
        imageDimensions;

    const imageWidth = naturalWidth;
    const imageHeight = naturalHeight;

    const containerWidth = clientWidth;
    const containerHeight = clientHeight;

    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imageWidth / imageHeight;

    const renderedHeight =
        imageAspectRatio > containerAspectRatio
            ? containerWidth / imageAspectRatio
            : containerHeight;

    const renderedWidth =
        containerAspectRatio > imageAspectRatio
            ? containerHeight * imageAspectRatio
            : containerWidth;

    const yExcess = containerHeight - renderedHeight;
    const xExcess = containerWidth - renderedWidth;

    const [x1, y1, w, h] = bbox;

    const cx = (x1 / imageWidth) * renderedWidth + xExcess / 2;
    const cy = (y1 / imageHeight) * renderedHeight + yExcess / 2;
    const cw = (w / imageWidth) * renderedWidth;
    const ch = (h / imageHeight) * renderedHeight;

    return {
        x: `${cx}px`,
        y: `${cy}px`,
        width: `${cw}px`,
        height: `${ch}px`,
    };
}
*/

interface ImageWrapperProps {
    item: {
        url: string,
    };
    itemIndex: number;
    onImageLoadStart: (itemKey: number) => void;
    onImageLoadEnd: (itemKey: number) => void;
}

interface ImageWrapperState {
    loading: boolean;
    error: boolean;
    retryKey: number;
    imageDimensions: {
        clientHeight: number,
        clientWidth: number,
        naturalHeight: number,
        naturalWidth: number,
    };
}

class ImageWrapper extends Component<ImageWrapperProps, ImageWrapperState> {
    constructor(props: ImageWrapperProps) {
        super(props);
        this.state = {
            loading: true,
            error: false,
            retryKey: 0,
            imageDimensions: undefined,
        };
    }

    componentDidMount() {
        const { onImageLoadStart, itemIndex } = this.props;
        onImageLoadStart(itemIndex);
    }

    handleLoadStart = () => {
        const { onImageLoadStart, itemIndex } = this.props;
        onImageLoadStart(itemIndex);
        this.setState({ loading: true });
    };

    handleError = () => {
        this.setState({ loading: false, error: true });
    };

    handleRetry = () => {
        this.setState(prevState => ({
            loading: true,
            error: false,
            retryKey: prevState.retryKey + 1,
        }));
    };

    handleLoadEnd = () => {
        const { onImageLoadEnd, itemIndex } = this.props;
        onImageLoadEnd(itemIndex);
        this.setState({ loading: false });
    };

    render() {
        const { item } = this.props;
        const { loading, error, retryKey } = this.state;

        /*
        const uri = 'http://images.cocodataset.org/val2017/000000438862.jpg';
        Image.getSize(uri, (width, height) => {
            this.setState(oldState => ({
                ...oldState,
                imageDimensions: {
                    ...(oldState?.imageDimensions ?? {}),
                    naturalHeight: height,
                    naturalWidth: width,
                },
            }));
        });

        const bboxForBox = calculateBbox(imageDimensions, bboxSample);
        console.log('here aditya', bboxForBox);
        */

        return (
            <View
                onLayout={event => {
                    const { width, height } = event.nativeEvent.layout;
                    this.setState(oldState => ({
                        ...oldState,
                        imageDimensions: {
                            ...(oldState?.imageDimensions ?? {}),
                            clientHeight: height,
                            clientWidth: width,
                        },
                    }));
                }}
                style={styles.container}
            >
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#fafafa"
                        style={styles.loader}
                    />
                )}
                {!error ? (
                    <Image
                        key={retryKey}
                        source={{ uri: item.url }}
                        style={styles.image}
                        onLoadStart={this.handleLoadStart}
                        onLoadEnd={this.handleLoadEnd}
                        onError={this.handleError}
                        fadeDuration={0}
                    />
                ) : (
                    <View style={styles.retryContainer}>
                        <Text style={styles.retryText}>
                            Failed to load image.
                        </Text>
                        <TouchableOpacity onPress={this.handleRetry}>
                            <Text style={styles.retryText}>Tap to retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* bboxForBox && (
                    <Svg
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none" // allows clicks to pass through
                    >
                        <Rect
                            x={bboxForBox.x}
                            y={bboxForBox.y}
                            width={bboxForBox.width}
                            height={bboxForBox.height}
                            stroke="black"
                            strokeWidth={2}
                            fill="transparent"
                        />
                    </Svg>
                ) */}
            </View>
        );
    }
}

export default ImageWrapper;
