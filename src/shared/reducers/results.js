// @flow
import {
    CANCEL_GROUP,
    COMMIT_TASK_SUCCESS,
    SUBMIT_BUILDING_FOOTPRINT,
    SUBMIT_CHANGE,
    TOGGLE_MAP_TILE,
} from '../actions/index';
import type { Action } from '../actions/index';
import type { ResultMapType } from '../flow-types';

const defaultResultsState = {
};

export default function results(state: ResultMapType = defaultResultsState, action: Action) {
    switch (action.type) {
    case CANCEL_GROUP: {
        // remove all results for this group
        const { groupDetails } = action;
        return Object.assign({}, ...Object.keys(state)
            .filter(id => state[id].projectId !== groupDetails.projectId
                && state[id].groupId !== groupDetails.groupId)
            .map(id => ({ [id]: state[id] })));
    }
    case TOGGLE_MAP_TILE: {
        // update the tile's state
        // $FlowFixMe
        const { tileInfo } = action;
        return {
            ...state,
            [tileInfo.resultId]: tileInfo,
        };
    }
    case SUBMIT_BUILDING_FOOTPRINT:
    case SUBMIT_CHANGE: {
        // $FlowFixMe
        const { resultObject } = action;
        return {
            ...state,
            [resultObject.resultId]: resultObject,
        };
    }
    case COMMIT_TASK_SUCCESS: {
        const { taskId } = action;
        // remove the task from state once uploaded
        return Object.assign({}, ...Object.keys(state)
            .filter(id => id !== taskId)
            .map(id => ({ [id]: state[id] })));
    }
    default:
        return state;
    }
}
