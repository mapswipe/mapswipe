export const WELCOME_COMPLETED = 'WELCOME_COMPLETED';
export const AUTH_STATUS_AVAILABLE = 'AUTH_STATUS_AVAILABLE';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';

export function completeWelcome() {
    return { type: WELCOME_COMPLETED };
}

export function authStatusAvailable(user) {
    return { type: AUTH_STATUS_AVAILABLE, user };
}

export function requestProjects() {
    return { type: REQUEST_PROJECTS };
}
