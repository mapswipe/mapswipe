// @flow
import { actionTypes } from 'react-redux-firebase';
import {
    AUTH_STATUS_AVAILABLE,
    SEEN_HELPBOX_TYPE_1,
    SELECT_LANGUAGE,
    START_GROUP,
    START_SENDING_RESULTS,
    TUTORIAL_COMPLETED,
    WELCOME_COMPLETED,
} from '../actions/index';
import Levels from '../Levels';
import type { Action } from '../actions';
import type { UIState } from '../flow-types';

const defaultHasSeenTutorial = [false, false, false, false];

const defaultUserState = {
    // this is set to true once the user has seen the help box for projects of type 1 (built_area)
    // This allows showing the help text when the user first opens a project of that type
    hasSeenHelpBoxType1: false,
    // if the user has gone through tutorial for projectType N, set the array below at N-1 to true
    hasSeenTutorial: defaultHasSeenTutorial,
    kmTillNextLevel: 0,
    languageCode: undefined,
    level: 1,
    progress: 0,
    username: '',
    teamId: undefined,
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
    // FIXME: if this is undefined (for instance when users upgrade the app,
    // we need to set a default value
    const newHasSeenTutorial = state.hasSeenTutorial
        ? state.hasSeenTutorial
        : defaultHasSeenTutorial;
    switch (action.type) {
        case SEEN_HELPBOX_TYPE_1:
            return {
                ...state,
                hasSeenHelpBoxType1: true,
            };
        case TUTORIAL_COMPLETED:
            newHasSeenTutorial[action.projectType - 1] = true;
            return {
                ...state,
                hasSeenTutorial: newHasSeenTutorial,
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
            // teamId is undefined before we receive the profile from the backend
            // we then set it to either the value or null to mean "we know the user
            // is not part of any team"
            // $FlowFixMe
            const teamId =
                action.profile && action.profile.teamId !== undefined
                    ? action.profile.teamId
                    : null;
            return {
                ...state,
                kmTillNextLevel,
                level,
                progress: percentage,
                teamId,
            };
        }
        case actionTypes.LOGOUT: {
            // when the user logs out, the ui.user data is not erased, which can lead
            // to one user seeing the previously logged in user's data. This is the case
            // with private teamId which could be problematic. So we clear teamId upon
            // logout to avoid any issues. It will be fetched from the backend upon next login.
            return {
                ...state,
                hasSeenTutorial: defaultHasSeenTutorial,
                languageCode: undefined,
                teamId: undefined,
                welcomeCompleted: false,
            };
        }
        default:
            return state;
    }
}
