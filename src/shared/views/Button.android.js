const React = require('react');
const ReactNative = require('react-native');

const {
    TouchableNativeFeedback,
    View,
} = ReactNative;

const Button = props => (
    <TouchableNativeFeedback
        background={TouchableNativeFeedback.SelectableBackground()}
        {...props}
    >
        {props.children}
    </TouchableNativeFeedback>
);

module.exports = Button;
