// @flow

import { actionTypes } from 'react-redux-firebase';
import type { ResultMapType, ResultType, State } from '../flow-types';

export const WELCOME_COMPLETED: 'WELCOME_COMPLETED' = 'WELCOME_COMPLETED';
export const AUTH_STATUS_AVAILABLE: 'AUTH_STATUS_AVAILABLE' = 'AUTH_STATUS_AVAILABLE';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const TOGGLE_MAP_TILE: 'TOGGLE_MAP_TILE' = 'TOGGLE_MAP_TILE';
export const SUBMIT_BUILDING_FOOTPRINT = 'SUBMIT_BUILDING_FOOTPRINT';
export const COMMIT_GROUP = 'COMMIT_GROUP';
export const COMMIT_GROUP_FAILED = 'COMMIT_GROUP_FAILED';
export const COMMIT_GROUP_SUCCESS = 'COMMIT_GROUP_SUCCESS';
export const COMMIT_TASK_FAILED = 'COMMIT_TASK_FAILED';
export const COMMIT_TASK_SUCCESS = 'COMMIT_TASK_SUCCESS';

type CompleteWelcome = { type: typeof WELCOME_COMPLETED };
export function completeWelcome(): CompleteWelcome {
    return { type: WELCOME_COMPLETED };
}

type AuthStatusAvailable = { type: typeof AUTH_STATUS_AVAILABLE, user?: {}};
export function authStatusAvailable(user: {}): AuthStatusAvailable {
    return { type: AUTH_STATUS_AVAILABLE, user };
}

type ToggleMapTile = { type: typeof TOGGLE_MAP_TILE, tileInfo: ResultType };
export function toggleMapTile(tileInfo: ResultType): ToggleMapTile {
    // dispatched every time a map tile is tapped to change its state
    return { type: TOGGLE_MAP_TILE, tileInfo };
}

export function commitGroupSuccess(taskId: string) {
    return { type: COMMIT_GROUP_SUCCESS, taskId };
}

export function commitGroupFailed(taskId: string, error: {}) {
    return { type: COMMIT_GROUP_FAILED, taskId, error };
}

type CommitTaskSuccess = { type: typeof COMMIT_TASK_SUCCESS, taskId: number };
export function commitTaskSuccess(taskId: string) {
    return { type: COMMIT_TASK_SUCCESS, taskId };
}

type CommitTaskFailed = { type: typeof COMMIT_TASK_FAILED, taskId: number };
export function commitTaskFailed(taskId: string, error: {}) {
    return { type: COMMIT_TASK_FAILED, taskId, error };
}

type SubmitFootprint = { type: typeof SUBMIT_BUILDING_FOOTPRINT, resultObject: ResultType };
export function submitFootprint(resultObject: ResultType): SubmitFootprint {
    return { type: SUBMIT_BUILDING_FOOTPRINT, resultObject };
}

export type GroupInfo = {
    addedDistance: number,
    groupId: number,
    projectId: number,
    contributionsCount: number,
    results: ResultMapType,
    zoomLevel: number
}

type CommitGroup = { type: typeof COMMIT_GROUP }
export type Action =
    | actionTypes.SET_PROFILE
    | AuthStatusAvailable
    | CommitGroup
    | CommitTaskSuccess
    | CommitTaskFailed
    | CompleteWelcome
    | ToggleMapTile

type PromiseAction = Promise<Action>;
type GetState = () => State;
type GetFirebase = () => Object;
type Dispatch = (action: Action | PromiseAction) => any;
type ThunkAction = (dispatch: Dispatch, getState: GetState, getFirebase: GetFirebase) => any;

export function commitGroup(groupInfo: GroupInfo): ThunkAction {
    // dispatched when a group is finished, when the user chooses to either
    // map another group, or complete mapping.
    // Note that there are situations were the redux state tree will contain results from
    // a previously mapped group/project, so we are going to upload results for everything now.
    return (dispatch: Dispatch, getState: GetState, getFirebase: GetFirebase) => {
        const firebase = getFirebase();
        const userId = firebase.auth().currentUser.uid;

        Object.keys(groupInfo.results).forEach((resultId) => {
            const resObj = groupInfo.results[resultId];
            const fbpath = `results/${resObj.projectId}/${resObj.groupId}/${userId}/`;
            // this overwrites the timestamp if there are multiple results for a group
            firebase.set(`${fbpath}timestamp`, resObj.timestamp);
            firebase
                .set(`${fbpath}results/${resObj.resultId}`, resObj.result)
                .then(() => dispatch(commitTaskSuccess(resultId)))
                .catch(error => dispatch(commitTaskFailed(resultId, error)));
        });

        // increase the completion count on the group so we know how many users
        // have swiped through it
        // FIXME: chain all the promises above so that we can throw an action
        // once they have all completed
        firebase.database().ref(`groups/${groupInfo.projectId}/${groupInfo.groupId}`)
            .transaction((group) => {
                const newGroup = group;
                if (group) {
                    newGroup.completedCount += 1;
                }
                return newGroup;
            });

        // update the user's contributions and total mapped area
        const addedContributions = groupInfo.contributionsCount || 0;
        const addedDistance = groupInfo.addedDistance || 0;
        firebase.database().ref(`users/${userId}/`)
            .transaction((user) => {
                const newUser = user;
                if (user) {
                    newUser.contributions += addedContributions;
                    newUser.distance += addedDistance;
                }
                return newUser;
            });
    };
}
