// @flow
import { actionTypes } from 'react-redux-firebase';
import {
    AUTH_STATUS_AVAILABLE,
    SEEN_HELPBOX_TYPE_1,
    SELECT_LANGUAGE,
    START_GROUP,
    START_SENDING_RESULTS,
    WELCOME_COMPLETED,
} from '../actions/index';
import Levels from '../Levels';
import type { Action } from '../actions';
import type { UIState } from '../flow-types';

const defaultUserState = {
    hasSeenHelpBoxType1: false,
    kmTillNextLevel: 0,
    languageCode: 'xx',
    level: 1,
    progress: 0,
    username: '',
    welcomeCompleted: false,
    user: null,
};

const maxLevel = 36;

export const getLevelForContributionCount = (count: number) => {
    let toReturn = 1;
    try {
        if (count > Levels[maxLevel].expRequired) {
            toReturn = maxLevel;
        } else {
            Object.keys(Levels)
                .slice(0, 35)
                .forEach((level) => {
                    if (
                        count >= Levels[level].expRequired &&
                        count < Levels[parseInt(level, 10) + 1].expRequired
                    ) {
                        toReturn = level;
                    }
                });
        }
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

const getProgress = (taskContributionCount: number, level: number) => {
    if (level === maxLevel) {
        // the user has reached the end...
        return { kmTillNextLevel: 999999999, percentage: 1 };
    }
    const currentLevelExp = Levels[level].expRequired;
    const nextLevelExp = Levels[level + 1].expRequired;
    const myExp = taskContributionCount;
    const expToGainTotal = nextLevelExp - currentLevelExp;
    const kmTillNextLevel = parseFloat(nextLevelExp - myExp);
    const percentage = 1 - kmTillNextLevel / expToGainTotal;
    return { kmTillNextLevel, percentage };
};

export default function user(
    state: UIState = defaultUserState,
    action: Action,
): UIState {
    let level = 1;
    switch (action.type) {
        case SEEN_HELPBOX_TYPE_1:
            return {
                ...state,
                hasSeenHelpBoxType1: true,
            };
        case WELCOME_COMPLETED:
            return {
                ...state,
                welcomeCompleted: true,
            };
        case SELECT_LANGUAGE:
            return {
                ...state,
                languageCode: action.languageCode,
            };
        case AUTH_STATUS_AVAILABLE:
            return {
                ...state,
                loggedIn: !!action.user,
                user: action.user,
            };
        case START_SENDING_RESULTS:
            return {
                ...state,
                // useful to prevent weird visual glitches while sending results
                isSendingResults: true,
            };
        case START_GROUP:
            return {
                ...state,
                isSendingResults: false,
            };
        case actionTypes.SET_PROFILE: {
            // TODO: can we refactor the profile to avoid having local key names that
            // are not in the datase?
            // $FlowFixMe
            const taskContributionCount = action.profile
                ? action.profile.taskContributionCount
                : 0;
            level = getLevelForContributionCount(taskContributionCount);
            const { kmTillNextLevel, percentage } = getProgress(
                taskContributionCount,
                level,
            );
            // $FlowFixMe
            const teamId = action.profile ? action.profile.teamId : undefined;
            return {
                ...state,
                kmTillNextLevel,
                level,
                progress: percentage,
                teamId,
            };
        }
        default:
            return state;
    }
}
