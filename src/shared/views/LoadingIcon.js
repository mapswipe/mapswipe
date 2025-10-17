// @flow
import * as React from 'react';
import { View, Animated, Easing, Image, Text } from 'react-native';
import { withTranslation } from 'react-i18next';
import type { TranslationFunction } from '../flow-types';

const GLOBAL = require('../Globals');

/* eslint-disable global-require */

const styles = {
    loadingText: {
        color: '#ffffff',
        fontWeight: '300',
        fontSize: 20,
        marginTop: 20,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
};

type Props = {
    t: TranslationFunction,
    label?: string,
    actions?: React.Node,
};

type State = {
    animOpacity: Animated.Value,
    showActions: boolean,
};

class LoadingComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            showActions: false,
        };
    }

    componentDidMount() {
        const { animOpacity } = this.state;
        Animated.loop(
            Animated.sequence([
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 3000,
                    // $FlowFixMe[method-unbinding]
                    easing: Easing.in(Easing.sin),
                    useNativeDriver: false,
                }),
                Animated.timing(animOpacity, {
                    toValue: 0,
                    duration: 3000,
                    // $FlowFixMe[method-unbinding]
                    easing: Easing.in(Easing.sin),
                    useNativeDriver: false,
                }),
            ]),
        ).start();
        // Show actions after 2 seconds
        this.timer = setTimeout(() => {
            this.setState({ showActions: true });
        }, 3000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render() {
        const { animOpacity, showActions } = this.state;
        const { t, label, actions } = this.props;

        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    height: GLOBAL.TILE_VIEW_HEIGHT,
                }}
            >
                <Animated.View
                    style={{
                        opacity: animOpacity,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: GLOBAL.SCREEN_WIDTH,
                    }}
                >
                    <Image
                        style={{ width: 100, height: 100 }}
                        source={require('./assets/loadinganimation.gif')}
                    />
                </Animated.View>
                <Text style={styles.loadingText} testID="loading-icon">
                    {label || t('loading')}
                </Text>
                {showActions && actions}
            </View>
        );
    }
}

export default (withTranslation('LoadingIcon')(LoadingComponent): any);
