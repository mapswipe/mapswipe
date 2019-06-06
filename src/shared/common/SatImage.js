import * as React from 'react';
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
} from 'react-native';
// import { Sentry } from 'react-native-sentry';

type Props = {
    source: Image.ImageSourcePropType,
    style: {},
};

type State = {
    source: string,
};

const styles = StyleSheet.create({
    imgText: {
        fontSize: 13,
        color: 'white',
    },
});

export default class SatImage extends React.Component<Props, State> {
    // An image component that works like a standard image, except
    // that it shows a "no image found" icon if the url provided is
    // invalid, or returns something like an HTTP 204 No Content code,
    // which seems quite common with WMS servers.
    constructor(props: Props) {
        super(props);
        this.state = {
            debugInfo: props.source.uri,
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

    onError = (evt: {}) => {
        const { source } = this.state;
        const debugInfo = `${source.uri} - ${JSON.stringify(evt.nativeEvent)}`;
        // Sentry.captureException(new Error(source.uri, evt));
        // console.log('SatImage', debugInfo, evt, evt.nativeEvent);
        this.setState({
            debugInfo,
            // eslint-disable-next-line global-require
            source: require('../../../assets/noImageAvailable.png'),
        });
    }

    render() {
        const { debugInfo, source } = this.state;
        const { style } = this.props;
        console.log('dbg', debugInfo);
        return (
            <ImageBackground
                onError={this.onError}
                source={source}
                style={style}
            >
                <Text style={styles.imgText}>
                    { debugInfo }
                </Text>
            </ImageBackground>
        );
    }
}
