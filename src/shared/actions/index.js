export const WELCOME_COMPLETED = 'WELCOME_COMPLETED';
export const AUTH_STATUS_AVAILABLE = 'AUTH_STATUS_AVAILABLE';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const TOGGLE_MAP_TILE = 'TOGGLE_MAP_TILE';
export const SUBMIT_BUILDING_FOOTPRINT = 'SUBMIT_BUILDING_FOOTPRINT';
export const COMMIT_GROUP = 'COMMIT_GROUP';
export const COMMIT_GROUP_FAILED = 'COMMIT_GROUP_FAILED';
export const COMMIT_GROUP_SUCCESS = 'COMMIT_GROUP_SUCCESS';

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

export function commitGroupSuccess(taskId) {
    return { type: COMMIT_GROUP_SUCCESS, taskId };
}

export function commitGroupFailed(taskId, error) {
    return { type: COMMIT_GROUP_FAILED, taskId, error };
}

export function submitFootprint(resultObject) {
    return { type: SUBMIT_BUILDING_FOOTPRINT, resultObject };
}

export function commitGroup(groupInfo) {
    // dispatched when a group is finished, when the user choose to either
    // map another group, or complete mapping.
    return (dispatch, getState, getFirebase) => {
        const firebase = getFirebase();
        const userId = firebase.auth().currentUser.uid;
        Object.keys(groupInfo.tasks).forEach(taskId => firebase
            .set(`results/${taskId}/${userId}/`, { data: groupInfo.tasks[taskId] })
            .then(() => dispatch(commitGroupSuccess(taskId)))
            .catch(error => dispatch(commitGroupFailed(taskId, error))));
        // increase the completion count on the group so we know how many users
        // have swiped through it
        // FIXME: chain all the promises above so that we can throw an action
        // once they have all completed
        firebase.database().ref(`groups/${groupInfo.projectId}/${groupInfo.groupId}`)
            .transaction((group) => {
                const newGroup = group;
                if (group) {
                    newGroup.completedCount += 1;
                }
                return newGroup;
            });

        // update the user's contributions and total mapped area
        const addedContributions = groupInfo.contributionsCount || 0;
        const addedDistance = groupInfo.addedDistance || 0;
        firebase.database().ref(`users/${userId}/`)
            .transaction((user) => {
                const newUser = user;
                if (user) {
                    newUser.contributions += addedContributions;
                    newUser.distance += addedDistance;
                }
                return newUser;
            });
    };
}
