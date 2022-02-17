// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Modal from 'react-native-modalbox';
import type { NavigationEventSubscription } from 'react-navigation';
import Button from '../common/Button';
import ProjectCard from './ProjectCard';
import LoadingIcon from './LoadingIcon';
import type { NavigationProp, ProjectType } from '../flow-types';
import { COLOR_DEEP_BLUE, COLOR_WHITE } from '../constants';

const GLOBAL = require('../Globals');

const style = StyleSheet.create({
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    inModalButton2: {
        backgroundColor: '#ee0000',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
        marginTop: 20,
    },
    inModalButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
    },
    listView: {
        width: GLOBAL.SCREEN_WIDTH,
        flex: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    modal: {
        padding: 20,
    },
    modal3: {
        marginTop: 10,
        height: 300,
        width: 300,
        backgroundColor: COLOR_WHITE,
        borderRadius: 2,
    },
    announcementButton: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 40,
        marginTop: 10,
        borderColor: COLOR_DEEP_BLUE,
        borderRadius: 0,
        borderWidth: 2,
    },
    tutPar: {
        fontSize: 14,
        color: '#575757',
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 10,
    },
});

type OrderedProject = {
    key: number,
    value: ProjectType,
};

type Props = {
    announcement: Object,
    firebase: Object,
    navigation: NavigationProp,
    projects: Array<OrderedProject>,
    teamId: ?string,
    teamName: ?string,
};

// request only active projects from firebase (status === 'active')
// firebase doesn't allow multiple query params, so for project types we filter in render()
// but here we can still limit to 20 projects maximum
// `path` defines where the resulting data is copied in the redux store
// (state.firebase.ordered.projects in this case, because we've asked for `orderByChild`)
// Note that the firebase access rules must be configured to allow this, or you'll get a
// permission denied error.
const projectsQuery = {
    isQuery: true,
    path: 'v2/projects',
    queryId: 'projectsQuery',
    queryParams: ['orderByChild=status', 'equalTo=active', 'limitToFirst=20'],
    storeAs: 'projects',
    type: 'value',
};
// load any announcement data from firebase
// (state.firebase.data.announcement here because we've not ordered the query)
const announcementQuery = {
    isQuery: true,
    path: 'v2/announcement',
    queryId: 'announcementQuery',
    queryParams: ['limitToLast=2'],
    storeAs: 'announcement',
    type: 'value',
};

class _RecommendedCards extends React.Component<Props> {
    // $FlowFixMe
    tutorialModal: ?Modal;

    // $FlowFixMe
    willBlurAnnouncementSubscription: NavigationEventSubscription;

    // $FlowFixMe
    willFocusAnnouncementSubscription: NavigationEventSubscription;

    // $FlowFixMe
    willBlurProjectSubscription: NavigationEventSubscription;

    // $FlowFixMe
    willFocusProjectSubscription: NavigationEventSubscription;

    componentDidMount() {
        const { teamId } = this.props;
        this.subscribeToAnnouncements();
        if (teamId) {
            this.getTeamName();
        }
    }

    componentWillUnmount() {
        const { firebase } = this.props;
        this.willFocusAnnouncementSubscription.remove();
        this.willBlurAnnouncementSubscription.remove();
        if (this.willFocusProjectSubscription !== undefined) {
            this.willFocusProjectSubscription.remove();
        }
        if (this.willBlurProjectSubscription !== undefined) {
            this.willBlurProjectSubscription.remove();
        }
        // stop watching the projects and announcement events,
        // so that when logging out and back in, we don't have
        // leftover listeners from the previous session
        const { type, path, storeAs, ...options } = projectsQuery;
        firebase.unWatchEvent(type, path, storeAs, options);
        firebase.unWatchEvent(
            announcementQuery.type,
            announcementQuery.path,
            announcementQuery.storeAs,
            { queryId: announcementQuery.queryId },
        );
    }

    componentDidUpdate = (oldProps: Props) => {
        // set teamId to null if we positively don't have one
        // then check here is we're not undefined, and set the listeners from then
        // and  not before
        const { teamId } = this.props;
        if (teamId !== undefined) {
            // teamId starts undefined, and we set it to either null if no team is assigned
            // or the teamId string. Here we check that we have indeed set the value before
            // we start requesting projects from the backend, to avoid fetching incorrect data
            // in the case where we get to this before the user profile has loaded
            this.subscribeToProjects();
            if (teamId !== oldProps.teamId) {
                // if the teamId hasn't changed, no need to fetch the teamName again
                this.getTeamName();
            }
        }
    };

    subscribeToAnnouncements = () => {
        const { type, path, storeAs, ...options } = announcementQuery;
        const { firebase, navigation } = this.props;
        this.willFocusAnnouncementSubscription = navigation.addListener(
            'willFocus',
            () => {
                firebase.watchEvent(type, path, storeAs, options);
            },
        );
        this.willBlurAnnouncementSubscription = navigation.addListener(
            'willBlur',
            () => {
                firebase.unWatchEvent(type, path, storeAs, options);
            },
        );
    };

    subscribeToProjects = () => {
        const { type, path, storeAs, ...options } = projectsQuery;
        const { firebase, navigation, projects, teamId } = this.props;
        if (teamId) {
            // the user is part of a team, amend the query to get private_active
            // projects instead of the default (public) "active" ones.
            // We need to query by teamId, so that we only get projects that actually
            // belong to our team, not all private ones.
            options.queryParams = [
                'orderByChild=teamId',
                `equalTo=${teamId}`,
                'limitToFirst=20',
            ];
        }

        if (projects === undefined) {
            // the subscription below only fires a query when the screen is focused
            // but it is often set up AFTER the initial focus, which means
            // we need to request data "manually" the first time if we have nothing
            // available yet
            firebase.watchEvent('once', path, storeAs, options);
        }

        if (this.willFocusProjectSubscription === undefined) {
            this.willFocusProjectSubscription = navigation.addListener(
                'willFocus',
                () => {
                    firebase.watchEvent(type, path, storeAs, options);
                },
            );
            this.willBlurProjectSubscription = navigation.addListener(
                'willBlur',
                () => {
                    firebase.unWatchEvent(type, path, storeAs, options);
                },
            );
        }
    };

    getTeamName = () => {
        // request the team display name from firebase
        // the result is then available under state.firebase.data.teamName
        const { firebase, teamId, teamName } = this.props;
        if (teamId && teamName === undefined) {
            firebase.watchEvent(
                'once',
                `v2/teams/${teamId}/teamName`,
                'teamName',
            );
        }
    };

    closeModal3 = () => {
        if (this.tutorialModal) {
            this.tutorialModal.close();
        }
    };

    openModal3 = () => {
        // TODO: check if we need to display this modal with redux
        if (this.tutorialModal) {
            this.tutorialModal.open();
        }
    };

    renderAnnouncement = () => {
        const { announcement, navigation } = this.props;
        if (!isLoaded(announcement) || isEmpty(announcement)) {
            return null;
        }
        return (
            <Button
                onPress={() => {
                    navigation.push('WebviewWindow', {
                        uri: announcement.url,
                    });
                }}
                key="announce"
                style={style.announcementButton}
                textStyle={{
                    color: COLOR_DEEP_BLUE,
                    fontSize: 13,
                    fontWeight: '700',
                }}
            >
                {announcement.text}
            </Button>
        );
    };

    renderHelpModal = () => {
        const { navigation } = this.props;
        return (
            <Modal
                key="modal"
                style={[style.modal, style.modal3]}
                backdropType="blur"
                position="top"
                ref={r => {
                    this.tutorialModal = r;
                }}
            >
                <Text style={style.header}>Tutorial</Text>
                <Text style={style.tutPar}>
                    Learn more about how to use MapSwipe!
                </Text>
                <Button
                    style={style.inModalButton2}
                    onPress={() => {
                        this.closeModal3();
                        navigation.push('WebviewWindow', {
                            uri: GLOBAL.TUT_LINK,
                        });
                    }}
                    textStyle={{
                        fontSize: 13,
                        color: COLOR_WHITE,
                        fontWeight: '700',
                    }}
                >
                    Go To Tutorial
                </Button>
                <Button
                    style={style.inModalButton}
                    onPress={this.closeModal3}
                    textStyle={{
                        fontSize: 13,
                        color: COLOR_WHITE,
                        fontWeight: '700',
                    }}
                >
                    No thanks
                </Button>
            </Modal>
        );
    };

    render() {
        const { navigation, projects } = this.props;
        if (!isLoaded(projects)) {
            return <LoadingIcon key="icon" />;
        }
        if (isLoaded(projects) && isEmpty(projects)) {
            return (
                <Text testID="recommended_cards_view">Nothing to work on!</Text>
            );
        }

        // since we can't completely filter projects by status AND projectType in firebase
        // we add a filter here to make sure we only display project types that the app can handle
        return (
            <ScrollView
                testID="recommended_cards_view"
                contentContainerStyle={style.listView}
                removeClippedSubviews
            >
                {this.renderAnnouncement()}
                {projects
                    .filter(
                        p =>
                            // keep only projects whose type we currently support
                            p.value &&
                            p.value.projectType &&
                            GLOBAL.SUPPORTED_PROJECT_TYPES.includes(
                                p.value.projectType,
                            ) &&
                            // only show "active" and "private_active" projects
                            // (this is only useful for private ones)
                            ['active', 'private_active'].includes(
                                p.value.status,
                            ),
                    )
                    .sort((a, b) => +b.value.isFeatured - +a.value.isFeatured)
                    .map(project => (
                        <ProjectCard
                            navigation={navigation}
                            project={project.value}
                            key={project.key}
                            cardIndex={project.key}
                        />
                    ))}
                {this.renderHelpModal()}
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    // define where the props (left of the colon) are coming from in the redux store (right)
    // the right side must match the definitions "path" under firebaseConnect below
    announcement: state.firebase.data.announcement,
    navigation: ownProps.navigation,
    projects: state.firebase.ordered.projects,
    teamId: state.ui.user.teamId,
    // use teamName as a prop so we can avoid fetching its value from the backend more than once
    teamName: state.firebase.data.teamName,
});

export default (compose(
    // this only supplies the firebase object in the props, the actual connection
    // to projects and announcement is done in componentDidMount
    // so that we can disable updates while mapping to prevent updates from other
    // users from resetting our mapping state, see #119
    firebaseConnect(), //() => [
    // connect to redux store
    connect(mapStateToProps),
)(_RecommendedCards): any);
