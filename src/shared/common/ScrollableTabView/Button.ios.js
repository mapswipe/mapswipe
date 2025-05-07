/* eslint-disable ft-flow/no-types-missing-file-annotation */
import * as React from 'react';
import { TouchableOpacity } from 'react-native';

type Props = {
    children: React.ReactNode,
};

const Button = (props: Props) => {
    const { children } = props;
    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
};

export default Button;
