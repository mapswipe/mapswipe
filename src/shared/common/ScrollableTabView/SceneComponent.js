import React from 'react';
import { View } from 'react-native';
import StaticContainer from './StaticContainer';

type Props = {
    children: React.ReactNode,
    shouldUpdated: boolean,
};

const SceneComponent = (props: Props) => {
    const { children, shouldUpdated, ...otherProps } = props;
    return (
        <View {...otherProps}>
            <StaticContainer shouldUpdate={shouldUpdated}>
                {children}
            </StaticContainer>
        </View>
    );
};

export default SceneComponent;
