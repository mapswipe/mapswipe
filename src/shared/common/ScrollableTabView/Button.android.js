// @flow
import * as React from 'react';
import { TouchableNativeFeedback } from 'react-native';

type Props = {
    children: React.ReactNode,
};

const Button = (props: Props) => {
    const { children } = props;
    return (
        <TouchableNativeFeedback
            delayPressIn={0}
            background={TouchableNativeFeedback.SelectableBackground()} // eslint-disable-line new-cap
            {...props}
        >
            {children}
        </TouchableNativeFeedback>
    );
};

export default Button;
