import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type {
    ImageStyleProp,
    TextStyleProp,
} from 'react-native/Libraries/StyleSheet/StyleSheet';
import * as Sentry from '@sentry/react-native';

const styles = StyleSheet.create({
    imageBackground: {
        height: '100%',
        width: '100%',
        position: 'absolute',
    },
});

type Props = {
    overlayText: string,
    overlayTextStyle: TextStyleProp,
    source: Image.ImageSourcePropType,
    style: ImageStyleProp,
};

type State = {
    source: string,
};

export default class SatImage extends React.Component<Props, State> {
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

    onError = (evt) => {
        const { source } = this.state;
        const { nativeEvent: { error } } = evt;
        Sentry.addBreadcrumb({
            message: 'Image not loading',
            data: {
                url: source.uri,
                error,
            },
        });
        Sentry.captureMessage('Cannot load sat imagery', 'warning');
        console.log(error);
        // eslint-disable-next-line global-require
        this.setState({ source: require('../../../assets/noImageAvailable.png') });
    }

    render() {
        const { source } = this.state;
        const { overlayText, overlayTextStyle, style } = this.props;
        return (
            <View
                style={style}
            >
                <Image
                    onError={this.onError}
                    source={source}
                    style={styles.imageBackground}
                />
                <Text
                    style={overlayTextStyle}
                >
                    {overlayText}
                </Text>
            </View>
        );
    }
}
