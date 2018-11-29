import {
    COMMIT_GROUP,
    TOGGLE_MAP_TILE,
} from '../actions/index';

const defaultResultsState = {
};

export default function results(state = defaultResultsState, action) {
    switch (action.type) {
    case TOGGLE_MAP_TILE:
        // update the tile's state
        const { tileInfo } = action;
        return {
            ...state,
            [tileInfo.id]: tileInfo,
        };
    case COMMIT_GROUP:
        // results have been copied to firebase, clear redux state now
    default:
        return state;
    }
}
