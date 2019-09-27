// @flow
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
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
import Button from 'apsl-react-native-button';

// $FlowFixMe
import Markdown from 'react-native-simple-markdown';
import ConnectionManager from '../ConnectionManager';
import {
    BUILDING_FOOTPRINTS,
    CHANGE_DETECTION,
    COLOR_DARK_GRAY,
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_GRAY,
    COLOR_WHITE,
    LEGACY_TILES,
} from '../constants';
import type { NavigationProp, ProjectType } from '../flow-types';

const Modal = require('react-native-modalbox');
const GLOBAL = require('../Globals');

/* eslint-disable global-require */

const style = StyleSheet.create({
    buttonText: {
        fontSize: 13,
        color: COLOR_WHITE,
        fontWeight: '700',
    },
    closeButton: {
        backgroundColor: COLOR_DARK_GRAY,
        alignItems: 'stretch',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 260,
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
    startButton2: {
        marginTop: 10,
        backgroundColor: '#e61c1c',
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
    downloadButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
    },
    header: {
        fontWeight: '700',
        color: COLOR_DARK_GRAY,
        fontSize: 18,
    },
    tutRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: 40,
    },
    tutPar: {
        fontSize: 13,
        color: '#575757',
        fontWeight: '500',
        lineHeight: 20,
    },
    tutText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#50acd4',
        marginTop: 5,
        lineHeight: 20,
    },
    modal: {
        padding: 20,
    },
    offlineModal: {
        height: GLOBAL.SCREEN_HEIGHT < 500 ? GLOBAL.SCREEN_HEIGHT - 50 : 500,
        width: 300,
        backgroundColor: COLOR_WHITE,
        borderRadius: 2,
    },
});

type Props = {
    navigation: NavigationProp,
}

/* eslint-disable react/destructuring-assignment */
const ProjectView = (props: Props) => (
    <ProjectHeader
        style={style.headerContainer}
        navigation={props.navigation}
        project={props.navigation.getParam('project', null)}
    />
);
/* eslint-enable react/destructuring-assignment */

type HeaderProps = {
    navigation: NavigationProp,
    project: ProjectType,
}

type HeaderState = {
    hasOfflineGroups: boolean,
    isDisabled: boolean,
}

class _ProjectHeader extends React.Component<HeaderProps, HeaderState> {
    constructor(props) {
        super(props);
        this.state = {
            hasOfflineGroups: false,
            isDisabled: true,
        };
    }

    componentDidMount() {
        const { project } = this.props;
        this.mounted = true;
        // FIXME see below :)
        // GLOBAL.ANALYTICS.logEvent('project_view_opened');
        const parent = this;
        parent.setState({
            hasOfflineGroups: GLOBAL.DB.hasOfflineGroups(`project-${project.projectId}`),
        });
        setInterval(() => {
            if (!parent.mounted) {
                return;
            }
            parent.setState({
                hasOfflineGroups: GLOBAL.DB.hasOfflineGroups(`project-${project.projectId}`),
            });
        }, 300);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    returnToView = () => {
        const { navigation } = this.props;
        navigation.pop();
    }

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
                        onPress: () => navigation.push('ProjectNav', {
                            uri: project,
                        }),
                    },
                    { text: 'Close', onPress: () => console.log('closed') },
                ],
            );
        }
    }

    openOfflineModal = () => {
        if (this.offlineModal) {
            this.offlineModal.open();
        }
    }

    closeOfflineModal = () => {
        if (this.offlineModal) {
            this.offlineModal.close();
        }
    }

    handleLater = () => {
        this.openOfflineModal();
    }

    mounted: boolean;

    offlineModal: ?Modal;

    checkWifiMapping() {
        const { navigation, project } = this.props;
        if (project.projectType === undefined) {
            // force a project type on the old ones
            project.projectType = LEGACY_TILES;
        }
        switch (project.projectType) {
        case LEGACY_TILES:
            // this is the original project type
            navigation.push('Mapper', {
                project,
            });
            break;
        case BUILDING_FOOTPRINTS:
            navigation.push('BuildingFootprintValidator', {
                project,
            });
            break;
        case CHANGE_DETECTION:
            navigation.push('ChangeDetectionScreen', {
                project,
            });
            break;
        default:
            console.log('Unsupported project', project);
        }
    }

    checkWifiDownload(originalTaskAmount) {
        const parent = this;
        // eslint-disable-next-line func-names
        return function (taskAmount) {
            console.log(`Starting download with ${taskAmount} tasks.`);
            if (!ConnectionManager.isOnline()) {
                Alert.alert(
                    'Warning: You are offline',
                    'Connect to a network and try again',
                    [
                        {
                            text: 'Got it',
                            onPress: () => {
                                console.log('canceled wifi');
                                parent.closeOfflineModal();
                            },
                        },

                    ],
                );
            } else if (ConnectionManager.isOnWifi()) {
                console.log(`We're headed to download${originalTaskAmount} tasks!`);
                Alert.alert(
                    'Be patient!',
                    'It might take a while for your download to start. ',
                    [
                        {
                            text: 'Ok',
                            onPress: () => {
                                parent.closeOfflineModal();
                            },
                        },
                    ],
                );
                // TODO: load data for offline work here
                parent.closeOfflineModal();
            } else {
                Alert.alert(
                    'Warning: You are not on wifi',
                    'Are you sure you wish to continue this download?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {
                                console.log('canceled wifi');
                                parent.closeOfflineModal();
                            },
                        },
                        {
                            text: 'Continue',
                            onPress: () => {
                                console.log(`We're headed to download${originalTaskAmount} tasks!`);
                                // TODO: load data for offline work here
                                parent.closeOfflineModal();
                            },
                        },
                    ],
                );
            }
        };
    }

    // eslint-disable-next-line class-methods-use-this
    handleInProgress() {

    }

    // eslint-disable-next-line class-methods-use-this
    handleRemoval() {
        Alert.alert(
            'Deletion Complete',
            'We found 0 groups in this project and deleted them.',
            [
                { text: 'Okay', onPress: () => console.log('closed') },
                { text: 'Close', onPress: () => console.log('closed') },
            ],
        );
    }

    // eslint-disable-next-line class-methods-use-this
    handleProjectRemoval() {
        Alert.alert(
            'Project Reset Complete',
            'Your progress will still be synced! Try Now!',
            [
                { text: 'Okay', onPress: () => console.log('closed') },
            ],
        );
    }

    render() {
        const { navigation, project } = this.props;
        const { hasOfflineGroups, isDisabled } = this.state;
        const renderQueue = [];
        const chunks = project.projectDetails.split('\\n');
        chunks.forEach((chunk) => {
            renderQueue.push(chunk, '\n');
        });

        // show progress = 0 if we somehow get a negative value
        const projectProgress = Math.max(0, project.progress).toFixed(0);

        return (
            <ScrollView
                style={style.projectViewContainer}
                testID="projectView"
            >
                <ImageBackground

                    style={style.backgroundImage}
                    source={{ uri: project.image }}
                >
                    <View style={style.overlay}>

                        <Text style={style.overlayProjectName}>{project.name.toUpperCase()}</Text>
                        <View style={style.bottomTextArea}>

                            <View style={style.infoArea}>
                                <View style={style.infoBlock}>
                                    <Image
                                        style={style.infoIcon}
                                        source={require('./assets/heart_icon.png')}
                                    />
                                    <Text
                                        style={style.infoBlockText}
                                    >
                                        {`${projectProgress}% GLOBAL PROGRESS BY `}
                                        {`${project.contributorCount} MAPPERS JUST LIKE YOU.`}
                                    </Text>
                                    <Image
                                        style={style.mmLogo}
                                        source={require('./assets/mmwhite.png')}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={style.backButtonContainer} onPress={this.returnToView}>
                        <Image
                            style={style.backButton}
                            source={require('./assets/backarrow_icon.png')}
                        />
                    </TouchableOpacity>
                </ImageBackground>

                {/* $FlowFixMe */}
                <View style={style.detailContainer}>

                    {/* $FlowFixMe */}
                    <Markdown style={style.projectDetails}>
                        {renderQueue}
                    </Markdown>
                    <Button
                        style={style.startButtonTutorial}
                        onPress={() => {
                            navigation.push('Mapper', {
                                project,
                                tutorial: true,
                            });
                        }}
                        textStyle={style.buttonText}
                    >
                    Tutorial
                    </Button>
                    <Button
                        style={style.startButton}
                        onPress={this.handlePress}
                        testID="mapNowButton"
                        textStyle={style.buttonText}
                    >
                    Map Now
                    </Button>

                    <Button
                        style={style.startButton2}
                        onPress={this.handleProjectRemoval}
                        textStyle={style.buttonText}
                    >
                    Bugs? Clear Project Data
                    </Button>

                    {hasOfflineGroups
                        ? (
                            <Button
                                style={style.startButton2}
                                onPress={this.handleRemoval}
                                textStyle={style.buttonText}
                            >
                        Remove Offline Data
                            </Button>
                        ) : null}
                </View>
                <Modal
                    style={[style.modal, style.offlineModal]}
                    backdropType="blur"
                    position="center"
                    ref={(r) => { this.offlineModal = r; }}
                    isDisabled={isDisabled}
                >
                    <Text style={style.header}>Download Options</Text>
                    <Text style={style.tutPar}>
We will let you know when your download ends, it will be auto-deleted after
                    completion. Do not close the Mapswipe app.
                    </Text>
                    <View style={style.tutRow}>
                        <Text style={style.tutText}>About 10 min of mapping</Text>
                    </View>
                    <Button
                        style={style.downloadButton}
                        onPress={this.checkWifiDownload(1000)}
                        textStyle={style.buttonText}
                    >
                    Download 1k tiles (approx 20MB)
                    </Button>
                    <View style={style.tutRow}>
                        <Text style={style.tutText}>About 40 min of mapping </Text>
                    </View>
                    <Button
                        style={style.downloadButton}
                        onPress={this.checkWifiDownload(4000)}
                        textStyle={style.buttonText}
                    >
                    Download 4k tiles (approx 80MB)
                    </Button>
                    <View style={style.tutRow}>
                        <Text style={style.tutText}>About 2.5 hrs of mapping</Text>
                    </View>
                    <Button
                        style={style.downloadButton}
                        onPress={this.checkWifiDownload(16000)}
                        textStyle={style.buttonText}
                    >
                    Download 16k tiles (approx 320MB)
                    </Button>
                    <Button
                        style={style.closeButton}
                        onPress={this.closeOfflineModal}
                        textStyle={style.buttonText}
                    >
                    Cancel
                    </Button>
                </Modal>
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
        project: ownProps.project,
    }
);

const ProjectHeader = compose(
    firebaseConnect(() => [
    ]),
    connect(
        mapStateToProps,
    ),
)(_ProjectHeader);

module.exports = ProjectView;
