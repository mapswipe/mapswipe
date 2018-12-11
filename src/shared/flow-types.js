// @flow
// type definitions. This should be safe to import everywhere

import { NavigationScreenProp, NavigationState } from 'react-navigation';

export type NavigationProp = NavigationScreenProp<NavigationState>;

export type ProjectType = {
    id: number,
    info: { api_key: string, tileserver_url: string },
    lookFor: string,
};

export type TaskType = {
    featureId?: number,
    geojson?: Object,
    id: string,
}

export type TaskMapType = { [task_id: string]: TaskType };

export type GroupType = {
    id: number,
    neededCount: number,
    projectId: number,
    tasks: TaskMapType,
    zoomLevel: number,
}

export type GroupMapType = { [group_id: string]: GroupType };

export type ResultType = {
}

export type ResultMapType = { [string]: ResultType };

// geographic types

export type Point = [number, number];

export type Polygon = Array<Point>;

export type BBOX = [number, number, number, number];

export type Tile = [number, number, number];
