// @flow
// type definitions. This should be safe to import everywhere
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import BottomProgress from './views/Mapper/BottomProgress';

// geographic types

export type Point = [number, number];

export type Polygon = Array<Point>;

export type BBOX = [number, number, number, number];

export type Tile = [number, number, number];

// dependencies types

export type NavigationProp = NavigationScreenProp<NavigationState>;

// types related to firebase data

export type ProjectType = {
    contributors: number,
    image: string,
    info: { apiKey: string, tileServerUrl: string },
    isFeatured: boolean,
    lookFor: string,
    name: string,
    projectDetails: string,
    projectId: number,
    projectType: ?number,
    progress: number,
    state: number,
};

export type ProjectMapType = { [project_id: string]: ProjectType };

export type TaskType = {
    groupId: number,
    featureId?: number,
    geojson?: { type: string, coordinates: { [number]: Polygon }},
    projectId: number,
    taskId: string,
    taskX: number,
    taskY: number,
    url: string,
}

export type TaskMapType = { [task_id: string]: TaskType };

export type GroupType = {
    groupId: number,
    neededCount: number,
    projectId: number,
    tasks: Array<TaskType>,
    zoomLevel: number,
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
}

export type GroupMapType = { [group_id: string]: GroupType };

export type ResultType = {
    groupId: number,
    projectId: number,
    resultId: string,
    result: number,
    timestamp: {},
}

export type ResultMapType = { [string]: ResultType };

// internal app types

export type Mapper = {
    closeTilePopup: () => void,
    openTilePopup: (any) => void,
    progress: BottomProgress,
    project: ProjectType,
}

// redux types

export type UIState = {
    welcomeCompleted: boolean,
};

export type State = {
    +firebase?: {},
    +results?: ResultMapType,
    +ui?: UIState,
};
