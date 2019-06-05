import * as React from 'react';
import { Image } from 'react-native';
import { Sentry } from 'react-native-sentry';

type Props = {
    source: Image.ImageSourcePropType,
    style: {},
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

    onError = (evt: {}) => {
        const { source } = this.state;
        Sentry.captureException(new Error(source, evt.nativeEvent));
        console.log('SatImage', evt, evt.nativeEvent);
        // eslint-disable-next-line global-require
        this.setState({ source: require('../../../assets/noImageAvailable.png') });
    }

    render() {
        const { source } = this.state;
        const { style } = this.props;
        return (
            <Image
                onError={this.onError}
                source={source}
                style={style}
            />
        );
    }
}
