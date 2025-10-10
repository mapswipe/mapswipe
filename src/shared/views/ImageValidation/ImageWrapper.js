import React, { Component } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

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
        height: '100%',
        objectFit: 'contain',
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

function calculateBbox(imageDimensions, bbox) {
    if (!imageDimensions || !bbox) {
        return undefined;
    }
    if (
        !imageDimensions.naturalHeight ||
        !imageDimensions.naturalWidth ||
        !imageDimensions.clientHeight ||
        !imageDimensions.clientWidth
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

interface ImageWrapperProps {
    item: {
        url: string,
    };
    itemIndex: number;
    onImageLoadStart: (itemKey: number) => void;
    onImageLoadEnd: (itemKey: number) => void;
    bbox: [number, number, number, number] | undefined;
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
    scale: number;
}

class ImageWrapper extends Component<ImageWrapperProps, ImageWrapperState> {
    constructor(props: ImageWrapperProps) {
        super(props);
        this.state = {
            loading: true,
            error: false,
            retryKey: 0,
            scale: 1,
            baseScale: 1,
            imageDimensions: undefined,
            focalX: 0,
            focalY: 0,
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

    handlePinch = event => {
        const { scale, focalX, focalY } = event.nativeEvent;

        this.setState(prev => {
            // Initialize baseScale if undefined
            const baseScale = prev.baseScale ?? 1;

            // Calculate new scale
            const newScale = baseScale * scale;

            // Only apply delta after first movement
            const deltaX =
                prev.lastFocalX != null ? focalX - prev.lastFocalX : 0;
            const deltaY =
                prev.lastFocalY != null ? focalY - prev.lastFocalY : 0;

            return {
                scale: newScale,
                focalX: prev.focalX + deltaX,
                focalY: prev.focalY + deltaY,
                lastFocalX: focalX,
                lastFocalY: focalY,
                baseScale, // keep it set
            };
        });
    };

    onPinchStateChange = event => {
        const { state } = event.nativeEvent;

        if (state === State.BEGAN) {
            // Capture the base scale at pinch start
            this.setState(prev => ({
                baseScale: prev.scale || 1,
                lastFocalX: null,
                lastFocalY: null,
            }));
        }

        if (state === State.END || state === State.CANCELLED) {
            // Optional: keep the final scale as new base
            this.setState(prev => ({
                ...prev,
                baseScale: 1,
                scale: 1,
                focalX: 0,
                focalY: 0,
                lastFocalX: null,
                lastFocalY: null,
            }));
        }
    };

    handleLoadEnd = () => {
        const { item, onImageLoadEnd, itemIndex } = this.props;
        onImageLoadEnd(itemIndex);
        this.setState({ loading: false });

        if (item.url) {
            Image.getSize(item.url, (width, height) => {
                this.setState(oldState => ({
                    ...oldState,
                    imageDimensions: {
                        ...(oldState?.imageDimensions ?? {}),
                        naturalHeight: height,
                        naturalWidth: width,
                    },
                }));
            });
        }
    };

    render() {
        const { item, bbox } = this.props;
        const {
            loading,
            error,
            retryKey,
            imageDimensions,
            focalX,
            focalY,
            scale,
        } = this.state;

        const bboxForBox = calculateBbox(imageDimensions, bbox);

        return (
            <PinchGestureHandler
                onGestureEvent={this.handlePinch}
                onHandlerStateChange={this.onPinchStateChange}
            >
                <View
                    onLayout={event => {
                        const { width, height, x, y } =
                            event.nativeEvent.layout;
                        this.setState(oldState => ({
                            ...oldState,
                            imageDimensions: {
                                ...(oldState?.imageDimensions ?? {}),
                                clientHeight: height,
                                clientWidth: width,
                            },
                            clientX: x,
                            clientY: y,
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
                            style={[
                                styles.image,
                                {
                                    transform: [
                                        { translateX: -focalX },
                                        { translateY: -focalY },
                                        { scale },
                                        { translateX: focalX },
                                        { translateY: focalY },
                                    ],
                                },
                            ]}
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
                                <Text style={styles.retryText}>
                                    Tap to retry
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {bboxForBox && (
                        <Svg
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    transform: [
                                        { translateX: -focalX },
                                        { translateY: -focalY },
                                        { scale },
                                        { translateX: focalX },
                                        { translateY: focalY },
                                    ],
                                },
                            ]}
                            pointerEvents="none" // allows clicks to pass through
                        >
                            <Rect
                                x={bboxForBox.x}
                                y={bboxForBox.y}
                                width={bboxForBox.width}
                                height={bboxForBox.height}
                                stroke="#fff"
                                strokeWidth={2}
                                fill="#fff"
                                fillOpacity="0.1"
                            />
                        </Svg>
                    )}
                </View>
            </PinchGestureHandler>
        );
    }
}

export default ImageWrapper;
