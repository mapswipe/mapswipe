import React, { Component } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

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
});

interface ImageWrapperProps {
    item: {
        url: string,
    };
}

interface ImageWrapperState {
    loading: boolean;
}

class ImageWrapper extends Component<ImageWrapperProps, ImageWrapperState> {
    constructor(props: ImageWrapperProps) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    handleLoadEnd = () => {
        this.setState({ loading: false });
    };

    render() {
        const { item } = this.props;
        const { loading } = this.state;

        return (
            <View style={styles.container}>
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#fafafa"
                        style={styles.loader}
                    />
                )}
                <Image
                    source={{ uri: item.url }}
                    style={styles.image}
                    onLoadEnd={this.handleLoadEnd}
                    fadeDuration={0}
                />
            </View>
        );
    }
}

export default ImageWrapper;
