export const WELCOME_COMPLETED = 'WELCOME_COMPLETED';
export const AUTH_STATUS_AVAILABLE = 'AUTH_STATUS_AVAILABLE';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const TOGGLE_MAP_TILE = 'TOGGLE_MAP_TILE';

export function completeWelcome() {
    return { type: WELCOME_COMPLETED };
}

export function authStatusAvailable(user) {
    return { type: AUTH_STATUS_AVAILABLE, user };
}

export function requestProjects() {
    return { type: REQUEST_PROJECTS };
}

export function toggleMapTile(tileInfo) {
    // dispatched every time a map tile is tapped to change its state
    return { type: TOGGLE_MAP_TILE, tileInfo };
}
