// @flow

import { actionTypes } from 'react-redux-firebase';
import { getVersion, getSystemName } from 'react-native-device-info';

import type { ResultMapType, ResultType, State } from '../flow-types';
import GLOBAL from '../Globals';

// this weird format is to make flow happy, so that it can check types of each action
export const SEEN_HELPBOX_TYPE_1: 'SEEN_HELPBOX_TYPE_1' = 'SEEN_HELPBOX_TYPE_1';
export const WELCOME_COMPLETED: 'WELCOME_COMPLETED' = 'WELCOME_COMPLETED';
export const TUTORIAL_COMPLETED: 'TUTORIAL_COMPLETED' = 'TUTORIAL_COMPLETED';
export const AUTH_STATUS_AVAILABLE: 'AUTH_STATUS_AVAILABLE' =
    'AUTH_STATUS_AVAILABLE';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const TOGGLE_MAP_TILE: 'TOGGLE_MAP_TILE' = 'TOGGLE_MAP_TILE';
export const SUBMIT_BUILDING_FOOTPRINT = 'SUBMIT_BUILDING_FOOTPRINT';
export const SUBMIT_CHANGE = 'SUBMIT_CHANGE';
export const CANCEL_GROUP = 'CANCEL_GROUP';
export const START_GROUP = 'START_GROUP';
export const START_SENDING_RESULTS = 'START_SENDING_RESULTS';
export const COMMIT_GROUP = 'COMMIT_GROUP';
export const COMMIT_GROUP_FAILED = 'COMMIT_GROUP_FAILED';
export const COMMIT_GROUP_SUCCESS = 'COMMIT_GROUP_SUCCESS';
export const COMMIT_TASK_FAILED = 'COMMIT_TASK_FAILED';
export const COMMIT_TASK_SUCCESS = 'COMMIT_TASK_SUCCESS';
export const SELECT_LANGUAGE = 'SELECT_LANGUAGE';

type SeenHelpBoxType1 = { type: typeof SEEN_HELPBOX_TYPE_1 };
export function seenHelpBoxType1(): SeenHelpBoxType1 {
    return { type: SEEN_HELPBOX_TYPE_1 };
}

type CompleteTutorial = {
    type: typeof TUTORIAL_COMPLETED,
    projectType: number,
};
// dispatched when the user reaches the end of a tutorial.
// projectType is the type of the corresponding project, so we can track
// tutorial completion per type of project
export function completeTutorial(projectType: number): CompleteTutorial {
    return { type: TUTORIAL_COMPLETED, projectType };
}

type SelectLanguage = { type: typeof SELECT_LANGUAGE, languageCode: string };
// dispatched when the user changes the language of the app
export function selectLanguage(languageCode: string): SelectLanguage {
    return { type: SELECT_LANGUAGE, languageCode };
}

type CompleteWelcome = { type: typeof WELCOME_COMPLETED };
export function completeWelcome(): CompleteWelcome {
    return { type: WELCOME_COMPLETED };
}

type AuthStatusAvailable = { type: typeof AUTH_STATUS_AVAILABLE, user?: {} };
export function authStatusAvailable(user: {}): AuthStatusAvailable {
    return { type: AUTH_STATUS_AVAILABLE, user };
}

type ToggleMapTile = { type: typeof TOGGLE_MAP_TILE, resultObject: ResultType };
export function toggleMapTile(resultObject: ResultType): ToggleMapTile {
    // dispatched every time a map tile is tapped to change its state
    return { type: TOGGLE_MAP_TILE, resultObject };
}

type CancelGroup = {
    type: typeof CANCEL_GROUP,
    projectId: string,
    groupId: string,
};
export function cancelGroup(grp: {
    projectId: string,
    groupId: string,
}): CancelGroup {
    // dispatched when the user cancels work on a group midway
    // this forces deletion of the results created so far
    return {
        type: CANCEL_GROUP,
        projectId: grp.projectId,
        groupId: grp.groupId,
    };
}
type StartGroup = {
    type: typeof START_GROUP,
    projectId: string,
    groupId: string,
    startTime: number,
};
export function startGroup(grp: {
    projectId: string,
    groupId: string,
    startTime: number,
}): StartGroup {
    // dispatched when the user starts work on a group
    return {
        type: START_GROUP,
        projectId: grp.projectId,
        groupId: grp.groupId,
        startTime: grp.startTime,
    };
}

type StartSendingResults = {
    type: typeof START_SENDING_RESULTS,
    projectId: string,
    groupId: string,
};
export function startSendingResults(
    // dispatched when the app starts uploading results to firebase
    // this is mostly used to set UI state in redux, so that we can show
    // a loading spinner to avoid showing artifacts due to resetting
    // the mapping lists, etc...
    projectId: string,
    groupId: string,
): StartSendingResults {
    return { type: START_SENDING_RESULTS, projectId, groupId };
}

type CommitGroupSuccess = {
    type: typeof COMMIT_GROUP_SUCCESS,
    projectId: string,
    groupId: string,
};
export function commitGroupSuccess(
    projectId: string,
    groupId: string,
): CommitGroupSuccess {
    return { type: COMMIT_GROUP_SUCCESS, projectId, groupId };
}

type CommitGroupFailed = {
    type: typeof COMMIT_GROUP_SUCCESS,
    projectId: string,
    groupId: string,
    error: {},
};
export function commitGroupFailed(
    projectId: string,
    groupId: string,
    error: {},
): CommitGroupFailed {
    return {
        type: COMMIT_GROUP_FAILED,
        projectId,
        groupId,
        error,
    };
}

type CommitTaskSuccess = { type: typeof COMMIT_TASK_SUCCESS, taskId: number };
export function commitTaskSuccess(taskId: string): {
    taskId: string,
    type: string,
} {
    return { type: COMMIT_TASK_SUCCESS, taskId };
}

type CommitTaskFailed = { type: typeof COMMIT_TASK_FAILED, taskId: number };
export function commitTaskFailed(
    taskId: string,
    error: {},
): { error: {}, taskId: string, type: string } {
    return { type: COMMIT_TASK_FAILED, taskId, error };
}

type SubmitChange = { type: typeof SUBMIT_CHANGE, resultObject: ResultType };
export function submitChange(resultObject: ResultType): SubmitChange {
    // dispatched when a result for ChangeDetection projects is submitted,
    // ie: when the user taps the image
    return { type: SUBMIT_CHANGE, resultObject };
}

type SubmitFootprint = {
    type: typeof SUBMIT_BUILDING_FOOTPRINT,
    resultObject: ResultType,
};
export function submitFootprint(resultObject: ResultType): SubmitFootprint {
    return { type: SUBMIT_BUILDING_FOOTPRINT, resultObject };
}

export type GroupInfo = {
    groupId: string,
    projectId: string,
    results: ResultMapType,
};

type CommitGroup = { type: typeof COMMIT_GROUP };
export type Action =
    // $FlowFixMe
    | actionTypes.SET_PROFILE
    | AuthStatusAvailable
    | CommitGroup
    | CommitTaskSuccess
    | CommitTaskFailed
    | CompleteWelcome
    | ToggleMapTile;

type PromiseAction = Promise<Action>;
type GetState = () => State;
type GetFirebase = () => Object;
type Dispatch = (action: Action | PromiseAction) => any;
type ThunkAction = (
    dispatch: Dispatch,
    getState: GetState,
    getFirebase: GetFirebase,
) => any;

export function commitGroup(groupInfo: GroupInfo): ThunkAction {
    // dispatched when a group is finished, when the user chooses to either
    // map another group, or complete mapping.
    // Note that when using the app offline, this action is triggered as well,
    // but the firebase layer will store results locally instead of uploading them
    // to the backend. This is transparent to us, so our code will not know its
    // online/offline status.
    return (
        dispatch: Dispatch,
        getState: GetState,
        getFirebase: GetFirebase,
    ) => {
        const firebase = getFirebase();
        const userId = firebase.auth().currentUser.uid;
        // get a single timestamp upon completion of the group
        const endTime = GLOBAL.DB.getTimestamp();
        const appVersion = getVersion();
        const systemName = getSystemName().toLowerCase(); // ios or android
        const clientType = systemName ? `mobile-${systemName}` : 'mobile';

        const { groupId, projectId, results } = groupInfo;
        dispatch(startSendingResults(projectId, groupId));
        const { startTime, ...rest } = results[projectId][groupId];
        const objToUpload = {
            startTime,
            endTime,
            results: rest,
            appVersion,
            clientType,
        };
        const fbPath = `v2/results/${projectId}/${groupId}/${userId}/`;
        firebase
            .set(fbPath, objToUpload)
            .then(() => dispatch(commitGroupSuccess(projectId, groupId)))
            .catch(error =>
                dispatch(commitGroupFailed(projectId, groupId, error)),
            );
    };
}
