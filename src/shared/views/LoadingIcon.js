// @flow
import * as React from 'react';
import {
    Animated,
    Easing,
    Image,
    Text,
} from 'react-native';

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

type State = {
    animOpacity: Animated.Value,
};

export default class LoadingComponent extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
        };
    }

    componentDidMount() {
        const { animOpacity } = this.state;
        Animated.loop(
            Animated.sequence([
                Animated.timing(
                    animOpacity,
                    {
                        toValue: 1,
                        duration: 3000,
                        easing: Easing.in(Easing.sin),
                        useNativeDriver: false,
                    },
                ),
                Animated.timing(
                    animOpacity,
                    {
                        toValue: 0,
                        duration: 3000,
                        easing: Easing.in(Easing.sin),
                        useNativeDriver: false,
                    },
                ),
            ]),
        ).start();
    }

    render() {
        const { animOpacity } = this.state;
        return (
            <Animated.View style={{
                opacity: animOpacity,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: GLOBAL.SCREEN_WIDTH,
                height: (GLOBAL.TILE_VIEW_HEIGHT),
            }}
            >
                <Image
                    style={{ width: 100, height: 100 }}
                    source={require('./assets/loadinganimation.gif')}
                />
                <Text style={styles.loadingText} testID="loading-icon">Loading...</Text>
            </Animated.View>
        );
    }
}
