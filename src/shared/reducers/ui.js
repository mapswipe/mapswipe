import { actionTypes } from 'react-redux-firebase';
import {
    AUTH_STATUS_AVAILABLE,
    WELCOME_COMPLETED,
} from '../actions/index';
import { Levels } from '../Levels';

const defaultUserState = {
    kmTillNextLevel: 0,
    level: 1,
    progress: 0,
    username: '',
    welcomeCompleted: true,
    user: null,
};

const maxLevel = 36;

const getLevelForDistance = (distance) => {
    let toReturn = 1;
    try {
        Object.keys(Levels).forEach((level) => {
            if (distance > Levels[maxLevel]) {
                toReturn = maxLevel;
            } else if (distance > Levels[level].expRequired && distance < Levels[parseInt(level, 10) + 1].expRequired) {
                toReturn = level;
            }
        });
        if (toReturn > maxLevel) {
            toReturn = maxLevel;
        } else if (toReturn < 1) {
            toReturn = 1;
        }
    } catch (err) {
        console.log(err);
    }
    return parseInt(toReturn, 10);
};

const getProgress = (distance, level) => {
    if (level === maxLevel) {
        // the user has reached the end...
        return { kmTillNextLevel: 999999999, percentage: 1 };
    }
    const currentLevelExp = Levels[level].expRequired;
    const nextLevelExp = Levels[level + 1].expRequired;
    const myExp = distance;
    const expToGainTotal = (nextLevelExp - currentLevelExp);
    const kmTillNextLevel = parseFloat(nextLevelExp - myExp);
    const percentage = 1 - (kmTillNextLevel / expToGainTotal);
    return { kmTillNextLevel, percentage };
};

export function user(state = defaultUserState, action) {
    let level = 1;
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
    case actionTypes.SET_PROFILE:
        const distance = action.profile ? action.profile.distance : 0;
        level = getLevelForDistance(distance);
        const { kmTillNextLevel, percentage } = getProgress(distance, level);
        return {
            ...state,
            kmTillNextLevel,
            level,
            progress: percentage,
        };
    default:
        return state;
    }
}
