import {
    AUTH_STATUS_AVAILABLE,
    WELCOME_COMPLETED
} from '../actions/index';

const defaultAuthState = {
    username: '',
    welcomeCompleted: true,
    loggedIn: null,
    user: null,
};

export function auth(state = defaultAuthState, action) {
    switch (action.type) {
    case WELCOME_COMPLETED:
        return {
            ...state,
            welcomeCompleted: true,
        };
    case AUTH_STATUS_AVAILABLE:
        return {
            ...state,
            loggedIn: !!action.user,
            user: action.user,
        };
    default:
        return state;
    }
}

//export function otherstuff(state = defaultOther, action) {
    //}
