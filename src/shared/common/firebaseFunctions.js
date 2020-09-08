// @flow
//
// Shared firebaseConnect() and redux connect() functions
// that can be reused across all project types, as they all share the same
// data structure. This should prevent too much code reuse, and variety of bugs...
import { firebaseConnect, isLoaded } from 'react-redux-firebase';
import get from 'lodash.get';

export const firebaseConnectGroup = (tutorialName?: string) =>
    firebaseConnect((props) => {
        const tutorial = props.navigation.getParam('tutorial', false);
        let tutorialProjectName;
        if (tutorialName === undefined) {
            tutorialProjectName = props.tutorialName;
        } else {
            tutorialProjectName = tutorialName;
        }
        if (tutorial) {
            // we're running the tutorial: we need to load the correct tutorial
            // project instead of the one we were showing in the menu
            return [
                {
                    type: 'once',
                    path: 'v2/projects',
                    queryParams: [
                        'orderByChild=status',
                        `equalTo=${tutorialProjectName}`,
                        'limitToFirst=1',
                    ],
                    storeAs: 'tutorial',
                },
                {
                    type: 'once',
                    path: `v2/groups/${tutorialProjectName}`,
                    queryParams: [
                        'limitToLast=1',
                        'orderByChild=requiredCount',
                    ],
                    storeAs: `tutorial/${tutorialProjectName}/groups`,
                },
            ];
        }
        const { projectId } = props.navigation.getParam('project', null);
        if (projectId) {
            return [
                {
                    type: 'once',
                    path: `v2/groups/${projectId}`,
                    queryParams: [
                        'limitToLast=15',
                        'orderByChild=requiredCount',
                    ],
                    storeAs: `projects/${projectId}/groups`,
                },
            ];
        }
        return [];
    });

export const mapStateToPropsForGroups = (tutorialName?: string) =>
    // This function is a common mapStateToProps used to fetch groups from firebase.
    // It looks at a few things to decide which group to fetch, based on the project
    // object that is passed as an argument to the navigation object.

    // $FlowFixMe
    (state, ownProps) => {
        let tutorialProjectName;
        // ownProps are the props passed to the Mapper or ChangeDetection component
        if (tutorialName === undefined) {
            tutorialProjectName = ownProps.tutorialName;
        } else {
            tutorialProjectName = tutorialName;
        }
        // if we're offline, there might be more than 1 group in the local
        // firebase data, for now, we just pick the first one
        const tutorial = ownProps.navigation.getParam('tutorial', false);
        let { projectId } = ownProps.navigation.getParam('project', null);
        const { contributions } = state.firebase.profile;
        let groupsMapped = [];
        if (contributions && contributions[projectId] !== undefined) {
            groupsMapped = Object.keys(contributions[projectId]);
        }
        if (tutorial) {
            projectId = tutorialProjectName;
        }
        // screens holds the content for each screen of the tutorial
        let screens = null;
        let groupId = '';
        let groups;
        const prefix = tutorial ? 'tutorial' : 'projects';
        // const projectData = state.firebase.data[prefix][projectId];
        const { data } = state.firebase;
        if (data[prefix] && data[prefix][projectId]) {
            ({ groups } = data[prefix][projectId]);
            if (tutorial) {
                ({ screens } = data[prefix][projectId]);
                screens = screens.filter((e) => e !== null);
            }
        }
        if (groups && isLoaded(groups)) {
            // we have a few groups to choose from, remove the ones the user has already worked on
            // and pick the first one left, as we now know the user hasn't already worked on it
            // FIXME: there is a rare edge case where the user has already mapped all the groups
            // that firebase returns. This would result in a crash, but it's quite unlikely, so
            // we'll quietly ignore it for now :)
            const groupsAvailable = Object.keys(groups);
            // eslint-disable-next-line prefer-destructuring
            const groupsToPickFrom = groupsAvailable.filter(
                (g) => !groupsMapped.includes(g),
            );
            groupId =
                groupsToPickFrom[
                    Math.floor(ownProps.randomSeed * groupsToPickFrom.length)
                ];
        }
        return {
            screens,
            group: get(
                state.firebase.data,
                `${prefix}.${projectId}.groups.${groupId}`,
            ),
            navigation: ownProps.navigation,
            onInfoPress: ownProps.onInfoPress,
            results: state.results,
            tutorial,
        };
    };

export default null;
