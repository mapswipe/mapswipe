// @flow
// type definitions. This should be safe to import everywhere
import { NavigationScreenProp, NavigationState } from 'react-navigation';

// geographic types

export type Point = [number, number];

export type Polygon = Array<Point>;

export type BBOX = [number, number, number, number];

export type Tile = [number, number, number];

// dependencies types

export type NavigationProp = NavigationScreenProp<NavigationState>;

// types related to firebase data

export type ProjectType = {
    id: number,
    info: { api_key: string, tileserver_url: string },
    isFeatured: bool,
    lookFor: string,
};

export type ProjectMapType = { [project_id: string]: ProjectType };

export type TaskType = {
    featureId?: number,
    geojson?: { type: string, coordinates: { [number]: Polygon }},
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
