/* eslint-disable */
const React = require('react');
const ReactNative = require('react-native');

const { View } = ReactNative;

const StaticContainer = require('./StaticContainer');

const SceneComponent = Props => {
    const { shouldUpdated, ...props } = Props;
    return (
        <View {...props}>
            <StaticContainer shouldUpdate={shouldUpdated}>
                {props.children}
            </StaticContainer>
        </View>
    );
};

module.exports = SceneComponent;
