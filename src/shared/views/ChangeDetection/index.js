// @flow
import * as React from 'react';
import ProjectLevelScreen from '../../common/ProjectLevelScreen';
import {
    submitChange,
} from '../../actions/index';
import ChangeDetector from './ChangeDetector';
import type {
    NavigationProp,
} from '../../flow-types';

type Props = {
    navigation: NavigationProp,
};

/* eslint-disable react/destructuring-assignment */
export default (props: Props) => (
    <ProjectLevelScreen
        Component={ChangeDetector}
        navigation={props.navigation}
        screenName="_ChangeDetectionScreen"
        submitResultFunction={submitChange}
    />
);
