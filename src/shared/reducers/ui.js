// @flow
import { actionTypes } from 'react-redux-firebase';
import {
    AUTH_STATUS_AVAILABLE,
    WELCOME_COMPLETED,
} from '../actions/index';
import Levels from '../Levels';
import type { Action } from '../actions';
import type { UIState } from '../flow-types';

const defaultUserState = {
    kmTillNextLevel: 0,
    level: 1,
    progress: 0,
    username: '',
    welcomeCompleted: false,
    user: null,
};

const maxLevel = 36;

const getLevelForContributionCount = (taskContributionCount) => {
    let toReturn = 1;
    try {
        Object.keys(Levels).forEach((level) => {
            if (taskContributionCount > Levels[maxLevel]) {
                toReturn = maxLevel;
            } else if (taskContributionCount > Levels[level].expRequired
                && taskContributionCount < Levels[parseInt(level, 10) + 1].expRequired) {
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

const getProgress = (taskContributionCount, level) => {
    if (level === maxLevel) {
        // the user has reached the end...
        return { kmTillNextLevel: 999999999, percentage: 1 };
    }
    const currentLevelExp = Levels[level].expRequired;
    const nextLevelExp = Levels[level + 1].expRequired;
    const myExp = taskContributionCount;
    const expToGainTotal = (nextLevelExp - currentLevelExp);
    const kmTillNextLevel = parseFloat(nextLevelExp - myExp);
    const percentage = 1 - (kmTillNextLevel / expToGainTotal);
    return { kmTillNextLevel, percentage };
};

export default function user(state: UIState = defaultUserState, action: Action): UIState {
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
    case actionTypes.SET_PROFILE: {
        // TODO: can we refactor the profile to avoid having local key names that
        // are not in the datase?
        // $FlowFixMe
        const taskContributionCount = action.profile ? action.profile.taskContributionCount : 0;
        level = getLevelForContributionCount(taskContributionCount);
        const { kmTillNextLevel, percentage } = getProgress(taskContributionCount, level);
        return {
            ...state,
            kmTillNextLevel,
            level,
            progress: percentage,
        };
    }
    default:
        return state;
    }
}
