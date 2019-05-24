// @flow
import React from 'react';
import {
    Text, View, Image,
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
    offset: number,
};

export default class LoadingComponent extends React.Component<{}, State> {
    nextOffset: number = 2;

    constructor(props: {}) {
        super(props);
        this.state = {
            offset: 0,
        };
    }

    componentDidMount() {
        const self = this;
        this.interval = setInterval(self.tick, 1000 / 50);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick = () => {
        let { offset } = this.state;
        offset += this.nextOffset;
        this.setState({ offset });
    }

    interval: IntervalID;

    render() {
        const { offset } = this.state;
        if (offset >= 0.8) {
            this.nextOffset = -0.04;
        } else if (offset <= 0.3) {
            this.nextOffset = 0.02;
        }
        return (
            <View style={{
                opacity: offset,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: GLOBAL.SCREEN_WIDTH,
                height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT),
            }}
            >
                <Image
                    style={{ width: 100, height: 100 }}
                    source={require('./assets/loadinganimation.gif')}
                />
                <Text style={styles.loadingText} testID="loading-icon">Loading...</Text>
            </View>
        );
    }
}
