// @flow
import * as React from 'react';
import { Animated, Easing, Image, Text } from 'react-native';
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
    },
};

type Props = {
    t: TranslationFunction,
};

type State = {
    animOpacity: Animated.Value,
};

class LoadingComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
        };
    }

    componentDidMount() {
        const { animOpacity } = this.state;
        Animated.loop(
            Animated.sequence([
                Animated.timing(animOpacity, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.in(Easing.sin),
                    useNativeDriver: false,
                }),
                Animated.timing(animOpacity, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.in(Easing.sin),
                    useNativeDriver: false,
                }),
            ]),
        ).start();
    }

    render() {
        const { animOpacity } = this.state;
        const { t } = this.props;
        return (
            <Animated.View
                style={{
                    opacity: animOpacity,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: GLOBAL.SCREEN_WIDTH,
                    height: GLOBAL.TILE_VIEW_HEIGHT,
                }}
            >
                <Image
                    style={{ width: 100, height: 100 }}
                    source={require('./assets/loadinganimation.gif')}
                />
                <Text style={styles.loadingText} testID="loading-icon">
                    {t('loading')}
                </Text>
            </Animated.View>
        );
    }
}

export default (withTranslation('LoadingIcon')(LoadingComponent): any);
