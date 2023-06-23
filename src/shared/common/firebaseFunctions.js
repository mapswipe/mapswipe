// @flow
//
// Shared firebaseConnect() and redux connect() functions
// that can be reused across all project types, as they all share the same
// data structure. This should prevent too much code reuse, and variety of bugs...
import { firebaseConnect, isLoaded } from 'react-redux-firebase';
import get from 'lodash.get';
import type {
    GroupType,
    Option,
    ResultType,
    ProjectInformation,
} from '../flow-types';

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
                    storeAs: `tutorial/${tutorialProjectId}/groups`,
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

type PropsForGroup = {
    exampleImage1: string,
    exampleImage2: string,
    screens: Array<any>,
    group: GroupType,
    navigation: any,
    onInfoPress: () => void,
    results: Array<ResultType>,
    tutorial: boolean,
    customOptions?: Array<Option>,
    informationPages?: ProjectInformation,
};

export const mapStateToPropsForGroups =
    (tutorialId?: string): PropsForGroup =>
    // This function is a common mapStateToProps used to fetch groups from firebase.
    // It looks at a few things to decide which group to fetch, based on the project
    // object that is passed as an argument to the navigation object.

    // $FlowFixMe
    (state, ownProps) => {
        let tutorialProjectId;
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
        let groups;
        let exampleImage1;
        let exampleImage2;
        let customOptions;
        let informationPages;
        const prefix = tutorial ? 'tutorial' : 'projects';
        const { data } = state.firebase;
        if (data[prefix] && data[prefix][projectId]) {
            ({ groups } = data[prefix][projectId]);
            if (tutorial) {
                // we pick some items from the tutorial project instead of the initial
                // project object
                ({
                    exampleImage1,
                    exampleImage2,
                    screens,
                    informationPages,
                    customOptions,
                } = data[prefix][projectId]);
            }

            customOptions = data[prefix][projectId].customOptions;

            if (!customOptions) {
                customOptions = [
                    {
                        value: 1,
                        title: 'Yes',
                        description: 'Yes',
                        icon: 'checkmarkOutline',
                        iconColor: '#bbcb7d',
                    },
                    {
                        value: 0,
                        title: 'No',
                        description: 'No',
                        icon: 'closeOutline',
                        iconColor: '#fd5054',
                    },
                    {
                        value: 2,
                        title: 'Not sure',
                        description: 'Not sure',
                        icon: 'removeOutline',
                        iconColor: '#adadad',
                    },
                ];
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
                g => !groupsMapped.includes(g),
            );
            groupId =
                groupsToPickFrom[
                    Math.floor(ownProps.randomSeed * groupsToPickFrom.length)
                ];
        }
        return {
            exampleImage1,
            exampleImage2,
            screens,
            group: get(
                state.firebase.data,
                `${prefix}.${projectId}.groups.${groupId}`,
            ),
            informationPages,
            customOptions,
            navigation: ownProps.navigation,
            onInfoPress: ownProps.onInfoPress,
            results: state.results,
            tutorial,
        };
    };

export default null;
