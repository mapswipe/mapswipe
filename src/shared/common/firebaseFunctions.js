// @flow
//
// Shared firebaseConnect() and redux connect() functions
// that can be reused across all project types, as they all share the same
// data structure. This should prevent too much code reuse, and variety of bugs...
import { firebaseConnect, isLoaded } from 'react-redux-firebase';
import get from 'lodash.get';
import type { GroupType, ResultType } from '../flow-types';

export const firebaseConnectGroup = (tutorialId?: string): any =>
    // the tutorialId parameter is not really used at this point, but we keep it
    // for now, as it potentially allows setting a default value for tutorials
    // quite easily.
    firebaseConnect(props => {
        const tutorial = props.navigation.getParam('tutorial', false);
        let tutorialProjectId;
        // TODO: revisit this later, once the new tutorial format is used everywhere
        // (app and projects) and possibly remove the test below is unused
        if (tutorialId === undefined) {
            tutorialProjectId = props.tutorialId;
        } else {
            tutorialProjectId = tutorialId;
        }
        if (tutorial) {
            // we're running the tutorial: we need to load the correct tutorial
            // project instead of the one we were showing in the menu
            // The tutorial is selected by its id, which must match the value
            // under project.tutorialId
            return [
                {
                    type: 'once',
                    path: `v2/projects/${tutorialProjectId}`,
                    storeAs: `tutorial/${tutorialProjectId}`,
                },
                {
                    type: 'once',
                    path: `v2/groups/${tutorialProjectId}`,
                    queryParams: [
                        'limitToLast=1',
                        'orderByChild=requiredCount',
                    ],
                    storeAs: `groups/${tutorialProjectId}`,
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
                        'limitToLast=3',
                        'orderByChild=requiredCount',
                    ],
                    storeAs: `groups/${projectId}`,
                },
            ];
        }
        return [];
    });

type PropsForGroup = {
    exampleImage1: string,
    exampleImage2: string,
    screens: Array<any>,
    group: GroupType,
    navigation: any,
    onInfoPress: () => void,
    results: Array<ResultType>,
    tutorial: boolean,
};

export const mapStateToPropsForGroups =
    (tutorialId?: string): PropsForGroup =>
    // This function is a common mapStateToProps used to fetch groups from firebase.
    // It looks at a few things to decide which group to fetch, based on the project
    // object that is passed as an argument to the navigation object.

    // $FlowFixMe
    (state, ownProps) => {
        let tutorialProjectId;
        let groupsToPickFromBool;
        groupsToPickFromBool = true;

        // ownProps are the props passed to the Mapper or ChangeDetection component
        if (tutorialId === undefined) {
            tutorialProjectId = ownProps.tutorialId;
        } else {
            tutorialProjectId = tutorialId;
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
            projectId = tutorialProjectId;
        }
        // screens holds the text content for each screen of the tutorial
        let screens = null;
        let groupId = '';
        let exampleImage1;
        let exampleImage2;
        const prefix = tutorial ? 'tutorial' : 'projects';
        const { data } = state.firebase;

        console.log('Data', data)
        //console.log('projects', data["projects"])
        console.log('projectId', projectId)
        let groups = null
        groups = get(
            state.firebase.data,
            `groups.${projectId}`,
        );
        console.log('groups', groups)

        if (data[prefix]) {
            if (tutorial) {
                // we pick some items from the tutorial project instead of the initial
                // project object
                ({ exampleImage1, exampleImage2, screens } =
                    data[prefix][projectId]);
            }
        }
        if (groups && isLoaded(groups)) {
            // we have a few groups to choose from, remove the ones the user has already worked on
            // and pick the first one left, as we now know the user hasn't already worked on it
            // FIXME: there is a rare edge case where the user has already mapped all the groups
            // that firebase returns. This would result in a crash, but it's quite unlikely, so
            // we'll quietly ignore it for now :)

            console.log('groups for project', groups)
            const groupsAvailable = Object.keys(groups);
            console.log('groupsAvailable', groupsAvailable);
            // eslint-disable-next-line prefer-destructuring
            const groupsToPickFrom = groupsAvailable.filter(
                g => !groupsMapped.includes(g),
            );
            groupId =
                groupsToPickFrom[
                    Math.floor(ownProps.randomSeed * groupsToPickFrom.length)
                ];
            if (groupsToPickFrom.length === 1) {
                // Here we set a boolean to make sure that the users stops mapping.
                groupsToPickFromBool = false;
            }

            if (groupsToPickFrom.length === 0) {
                // We should not reach this point, as we check the number of groups available.
                // But, if we reach this point, this will give the user a loading icon
                // and the user is struck.
                console.log(
                    'groups are loaded already, but there are no groups to pick from.',
                );
                console.log('groupsToPickFrom', groupsToPickFrom);
                console.log('groupsAvailable', groupsAvailable);
                console.log('groupMapped', groupsMapped);
            }
            console.log('# groupsToPickFrom', groupsToPickFrom.length);
        }
        const group = get(
            state.firebase.data,
            `groups.${projectId}.${groupId}`,
        );

        if (!isLoaded(groups) && !group) {
            // this is okay, we just try again untill the groups are loaded.
            console.log(
                'Groups are not loaded yet and group is not available.',
                'Wait to receive data from firebase.',
            );
            console.log('projectId', projectId);
        }

        return {
            exampleImage1,
            exampleImage2,
            screens,
            group,
            navigation: ownProps.navigation,
            onInfoPress: ownProps.onInfoPress,
            results: state.results,
            tutorial,
            groupsToPickFromBool,
        };
    };

export default null;
