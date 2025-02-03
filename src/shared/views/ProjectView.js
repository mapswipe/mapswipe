// @flow
import type { Node } from 'react';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import fb from '@react-native-firebase/app';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    Image,
    ImageBackground,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { withTranslation } from 'react-i18next';

// $FlowFixMe
import Markdown from 'react-native-simple-markdown';
import Button from '../common/Button';
import {
    BUILDING_FOOTPRINTS,
    CHANGE_DETECTION,
    COLOR_DARK_GRAY,
    COLOR_RED,
    COLOR_LIGHT_GRAY,
    COLOR_WHITE,
    COMPLETENESS_PROJECT,
    LEGACY_TILES,
} from '../constants';
import { getProjectProgressForDisplay } from '../Database';
import LevelProgress from '../common/LevelProgress';
import type {
    NavigationProp,
    ProjectType,
    TranslationFunction,
    UserProfile,
} from '../flow-types';

const GLOBAL = require('../Globals');

/* eslint-disable global-require */

const style = StyleSheet.create({
    buttonText: {
        fontSize: 13,
        color: COLOR_WHITE,
        fontWeight: '700',
    },
    projectViewContainer: {
        flex: 1,
    },
    detailContainer: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        paddingTop: 20,
    },
    headerContainer: {
        flex: 1,
    },
    backgroundImage: {
        borderRadius: 0,
        flex: 1,
        height: 250,
    },
    overlay: {
        backgroundColor: 'rgba(52,52,52,0.7)',
        flex: 1,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayProjectName: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 20,
        width: 200,
        textAlign: 'center',
    },
    bottomTextArea: {
        position: 'absolute',
        flex: 1,
        height: 175,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 20,
        height: 20,
    },
    backButtonContainer: {
        width: 60,
        height: 60,
        top: 0,
        padding: 20,
        left: 0,
        position: 'absolute',
    },
    projectDetails: {
        width: GLOBAL.SCREEN_WIDTH,
    },
    infoArea: {
        borderTopWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: COLOR_DARK_GRAY,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: GLOBAL.SCREEN_WIDTH,
        backgroundColor: 'rgba(52,52,52,0.5)',
    },
    infoBlock: {
        borderColor: COLOR_DARK_GRAY,
        flex: 1,
        height: 30,
        flexDirection: 'row',
    },
    infoBlockText: {
        color: COLOR_LIGHT_GRAY,
        fontWeight: '500',
        fontSize: 11,
        marginLeft: 20,
        width: 170,
        height: 30,
        marginTop: 3,
    },
    infoIcon: {
        marginLeft: 20,
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    mmLogo: {
        width: 100,
        height: 30,
        resizeMode: 'contain',
    },
    startButton: {
        marginTop: 10,
        backgroundColor: '#0c1949',
        flex: 1,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    startButtonTutorial: {
        marginTop: 10,
        backgroundColor: '#33A929',
        flex: 1,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    progressBox: {
        marginBottom: 20,
        marginLeft: -15,
    },
    progressText: {
        marginLeft: 15,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    quotaReachedWarning: {
        color: COLOR_RED,
        fontWeight: '600',
        marginLeft: 15,
    },
});

type Props = {
    navigation: NavigationProp,
};

/* eslint-disable react/destructuring-assignment */
const ProjectView = (props: Props): Node => (
    <ProjectHeader
        style={style.headerContainer}
        navigation={props.navigation}
        project={props.navigation.getParam('project', null)}
    />
);
/* eslint-enable react/destructuring-assignment */

type HeaderProps = {
    hasSeenTutorial: ?Array<boolean>,
    navigation: NavigationProp,
    profile: UserProfile,
    project: ProjectType,
    t: TranslationFunction,
};

class _ProjectHeader extends React.Component<HeaderProps> {
    // $FlowFixMe

    componentDidMount() {
        fb.analytics().logEvent('project_view_opened');
    }

    returnToView = () => {
        const { navigation } = this.props;
        navigation.pop();
    };

    handlePress = () => {
        const { navigation, project } = this.props;
        if (!GLOBAL.DB.hasOpenDownloads(`project-${project.projectId}`)) {
            this.checkWifiMapping();
        } else {
            Alert.alert(
                'You are currently downloading this project',
                'To avoid double-mapping, please pick another project to map online.',
                [
                    {
                        text: 'Okay',
                        onPress: () =>
                            navigation.push('ProjectNav', {
                                uri: project,
                            }),
                    },
                    { text: 'Close', onPress: () => console.log('closed') },
                ],
            );
        }
    };

    checkWifiMapping() {
        const { hasSeenTutorial, navigation, project } = this.props;
        if (project.projectType === undefined) {
            // force a project type on the old ones
            project.projectType = LEGACY_TILES;
        }
        fb.analytics().logEvent('mapping_started', {
            projectType: project.projectType,
        });
        // do we need to force the user through the tutorial?
        // TODO: for now, we only force it for private projects
        // that have a max work per user value, to avoid forcing existing
        // users through a tutorial that might not be in their language yet
        const forceTutorial =
            project.maxTasksPerUser !== undefined
                ? hasSeenTutorial === undefined ||
                  hasSeenTutorial === null ||
                  !hasSeenTutorial[project.projectType - 1]
                : false;

        switch (project.projectType) {
            case COMPLETENESS_PROJECT:
            case LEGACY_TILES:
                // this is the original project type
                navigation.push('Mapper', {
                    project,
                    tutorial: forceTutorial,
                });
                break;
            case BUILDING_FOOTPRINTS:
                navigation.push('BuildingFootprintScreen', {
                    project,
                    tutorial: forceTutorial,
                });
                break;
            case CHANGE_DETECTION:
                navigation.push('ChangeDetectionScreen', {
                    project,
                    tutorial: forceTutorial,
                });
                break;
            default:
                console.log('Unsupported project', project);
        }
    }

    render() {
        const { navigation, profile, project, t } = this.props;
        const renderQueue = [];
        const chunks = project.projectDetails.split('\\n');
        chunks.forEach(chunk => {
            renderQueue.push(chunk, '\n');
        });

        // show progress = 0 if we somehow get a negative value
        const projectProgress = getProjectProgressForDisplay(project.progress);
        const { contributorCount } = project;
        let tasksCompleted = 0;
        let userProgress = 0;
        // by default, users can always map, unless they've reached their quota
        // which we check below
        let userCanMap = true;

        // calculate user's progress on this project if the project has a max tasks/user set
        if (project.maxTasksPerUser) {
            if (
                profile.contributions &&
                profile.contributions[project.projectId]
            ) {
                tasksCompleted =
                    profile.contributions[project.projectId]
                        .taskContributionCount || 0;
            }
            const maxTasks = parseInt(project.maxTasksPerUser, 10);
            // users can do more tasks than the limit, so we round up to 100% (ie: 1) max
            userProgress = Math.min(tasksCompleted / maxTasks, 1);
            userCanMap = tasksCompleted < maxTasks;
        }

        return (
            <ScrollView style={style.projectViewContainer} testID="projectView">
                <ImageBackground
                    style={style.backgroundImage}
                    source={{ uri: project.image }}
                >
                    <View style={style.overlay}>
                        <Text style={style.overlayProjectName}>
                            {project.name.toUpperCase()}
                        </Text>
                        <View style={style.bottomTextArea}>
                            <View style={style.infoArea}>
                                <View style={style.infoBlock}>
                                    <Image
                                        style={style.infoIcon}
                                        source={require('./assets/heart_icon.png')}
                                    />
                                    <Text style={style.infoBlockText}>
                                        {t(
                                            'x pc global progress by n mappers',
                                            {
                                                projectProgress,
                                                contributorCount,
                                            },
                                        )}
                                    </Text>
                                    <Image
                                        style={style.mmLogo}
                                        source={require('./assets/mmwhite.png')}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={style.backButtonContainer}
                        onPress={this.returnToView}
                    >
                        <Image
                            style={style.backButton}
                            source={require('./assets/backarrow_icon.png')}
                        />
                    </TouchableOpacity>
                </ImageBackground>

                {/* $FlowFixMe */}
                <View style={style.detailContainer}>
                    {project.maxTasksPerUser && (
                        <View style={style.progressBox}>
                            <Text style={style.progressText}>
                                Your progress:
                            </Text>
                            <LevelProgress
                                progress={userProgress}
                                text={t('userProgressForProject', {
                                    userProgress: parseInt(
                                        userProgress * 100,
                                        10,
                                    ),
                                })}
                            />
                            {userCanMap || (
                                <Text style={style.quotaReachedWarning}>
                                    {t('quotaReachedWarning')}
                                </Text>
                            )}
                        </View>
                    )}
                    {/* $FlowFixMe */}
                    <Markdown style={style.projectDetails}>
                        {renderQueue}
                    </Markdown>
                    <Button
                        style={style.startButtonTutorial}
                        onPress={() => {
                            if (!project.tutorialId) {
                                Alert.alert(
                                    t('No tutorial available'),
                                    t(
                                        'There is no tutorial for this project yet.',
                                    ),
                                );
                                return;
                            }
                            // we have a tutorialId, let's show it
                            fb.analytics().logEvent('starting_tutorial', {
                                projectType: project.projectType,
                            });
                            switch (project.projectType) {
                                case LEGACY_TILES:
                                case COMPLETENESS_PROJECT:
                                    navigation.push('Mapper', {
                                        project,
                                        tutorial: true,
                                    });
                                    break;
                                case CHANGE_DETECTION:
                                    navigation.push('ChangeDetectionScreen', {
                                        project,
                                        tutorial: true,
                                    });
                                    break;
                                case BUILDING_FOOTPRINTS:
                                    navigation.push('BuildingFootprintScreen', {
                                        project,
                                        tutorial: true,
                                    });
                                    break;
                                default:
                                    Alert.alert(
                                        'Coming soon!',
                                        'The tutorial is not ready yet for this type of projects.',
                                    );
                            }
                        }}
                        textStyle={style.buttonText}
                    >
                        {t('tutorial')}
                    </Button>
                    <Button
                        style={style.startButton}
                        onPress={
                            userCanMap ? this.handlePress : this.returnToView
                        }
                        testID="mapNowButton"
                        textStyle={style.buttonText}
                    >
                        {userCanMap ? t('map now') : t('chooseAnotherProject')}
                    </Button>
                </View>
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    hasSeenTutorial: state.ui.user.hasSeenTutorial,
    navigation: ownProps.navigation,
    profile: state.firebase.profile,
    project: ownProps.project,
});

const ProjectHeader = compose(
    withTranslation('projectView'),
    firebaseConnect(() => []),
    connect(mapStateToProps),
)(_ProjectHeader);

module.exports = ProjectView;
