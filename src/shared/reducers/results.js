// @flow
import {
    COMMIT_TASK_SUCCESS,
    SUBMIT_BUILDING_FOOTPRINT,
    TOGGLE_MAP_TILE,
} from '../actions/index';
import type { Action } from '../actions/index';
import type { ResultMapType } from '../flow-types';

const defaultResultsState = {
};

export default function results(state: ResultMapType = defaultResultsState, action: Action) {
    switch (action.type) {
    case TOGGLE_MAP_TILE: {
        // update the tile's state
        // $FlowFixMe
        const { tileInfo } = action;
        return {
            ...state,
            [tileInfo.id]: tileInfo,
        };
    }
    case SUBMIT_BUILDING_FOOTPRINT: {
        // $FlowFixMe
        const { resultObject } = action;
        return {
            ...state,
            [resultObject.id]: resultObject,
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
