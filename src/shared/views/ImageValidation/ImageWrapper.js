import React, { Component } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

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
}

class ImageWrapper extends Component<ImageWrapperProps, ImageWrapperState> {
    constructor(props: ImageWrapperProps) {
        super(props);
        this.state = {
            loading: true,
            error: false,
            retryKey: 0,
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

        return (
            <View style={styles.container}>
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
            </View>
        );
    }
}

export default ImageWrapper;
