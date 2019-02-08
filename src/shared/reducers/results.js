// @flow
import {
    COMMIT_GROUP,
    SUBMIT_BUILDING_FOOTPRINT,
    TOGGLE_MAP_TILE,
} from '../actions/index';

const defaultResultsState = {
};

type Action =
    | { type: COMMIT_GROUP}
    | { type: SUBMIT_BUILDING_FOOTPRINT, resultObject: { id: number }}
    | { type: TOGGLE_MAP_TILE, tileInfo: { id: number }};

export default function results(state: {} = defaultResultsState, action: Action) {
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
    case COMMIT_GROUP:
        // results have been copied to firebase, clear redux state now
        return state;
    default:
        return state;
    }
}
