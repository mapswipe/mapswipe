// @flow
import * as React from 'react';
import ProjectLevelScreen from '../../common/ProjectLevelScreen';
import {
    submitFootprint,
} from '../../actions/index';
import Validator from './Validator';
import type {
    NavigationProp,
} from '../../flow-types';

type Props = {
    navigation: NavigationProp,
};

/* eslint-disable react/destructuring-assignment */
export default (props: Props) => (
    <ProjectLevelScreen
        Component={Validator}
        navigation={props.navigation}
        screenName="BuildingFootprintValidator"
        submitResultFunction={submitFootprint}
    />
);
