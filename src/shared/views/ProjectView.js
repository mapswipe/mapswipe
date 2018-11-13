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

import Markdown from 'react-native-simple-markdown';

const Modal = require('react-native-modalbox');
const GLOBAL = require('../Globals');


const style = StyleSheet.create({

    closeButton: {
        backgroundColor: '#212121',
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
        flex: 1,
        borderRadius: 5,
        height: 250,
        borderRadius: 0,
    },
    overlay: {
        backgroundColor: 'rgba(52,52,52,0.7)',
        flex: 1,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayProjectName: {
        color: '#FFFFFF',
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
    bookmarkButton: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        width: 15,
        resizeMode: 'contain',
        right: 25,
        top: 0,
        position: 'absolute',
    },
    projectName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212121',
    },

    projectDetails: {
        width: GLOBAL.SCREEN_WIDTH,
    },

    heart: {
        width: 13,
        height: 13,
        resizeMode: 'contain',
        marginTop: 5,

    },

    infoArea: {
        borderTopWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#212121',

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
        borderColor: '#212121',
        flex: 1,
        height: 30,
        flexDirection: 'row',
    },
    infoBlockText: {

        color: '#e8e8e8',
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
    inProgressButton: {
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },

    downloadButton: {
        backgroundColor: '#0d1949',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
    },
    header: {
        fontWeight: '700',
        color: '#212121',
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

    modal2: {
        height: 230,
        backgroundColor: '#3B5998',
    },

    modal3: {
        height: GLOBAL.SCREEN_HEIGHT < 500 ? GLOBAL.SCREEN_HEIGHT - 50 : 500,
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },


});

const ProjectView = props => (
    <ProjectHeader
        style={style.headerContainer}
        navigation={props.navigation}
        project={props.navigation.getParam('project', null)}
    />
);

class _ProjectHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: 0,
            hasOfflineGroups: false,
        };
    }

    returnToView = () => {
        this.props.navigation.pop();
    }

    mounted: false;

    componentDidMount() {
        const { project } = this.props;
        GLOBAL.GRADIENT_COUNT = 0;
        this.mounted = true;
        // FIXME see below :)
        // GLOBAL.ANALYTICS.logEvent('project_view_opened');
        const parent = this;
        parent.setState({
            hasOfflineGroups: GLOBAL.DB.hasOfflineGroups(`project-${project.id}`),
        });
        setInterval(() => {
            if (!parent.mounted) {
                return;
            }
            let progress = 0;
            const projectKey = `project-${project.id}`;
            if (GLOBAL.DB.totalRequestsOutstanding2[projectKey] !== undefined) {
                progress = Math.ceil(100 - ((GLOBAL.DB.totalRequestsOutstanding2[projectKey] / GLOBAL.DB.totalRequests[projectKey]) * 100));
            }
            parent.setState({
                progress,
                hasOfflineGroups: GLOBAL.DB.hasOfflineGroups(`project-${project.id}`),
            });
        }, 300);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    _handlePress = () => {
        const { navigation, project } = this.props;
        if (GLOBAL.DB.hasOpenDownloads(`project-${project.id}`) === false) {
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

    _handleLater() {
        this.openModal3();
    }

    openModal3 = (id) => {
        this.refs.modal3.open();
    }

    returnToView = () => {
        this.props.navigation.pop();
    }

    closeModal3 = (id) => {
        this.refs.modal3.close();
    }

    checkWifiMapping() {
        const { navigation, project } = this.props;

        if (GLOBAL.DB.getConnectionManager().isOnWifi() || !GLOBAL.DB.getConnectionManager().isOnline()) {
            navigation.push('Mapper', {
                project,
            });
        } else {
            Alert.alert(
                'Warning: You are not on wifi',
                'You can map about 8 hours per 1GB of data',
                [
                    { text: 'Cancel', onPress: () => console.log('canceled wifi mapping') },
                    {
                        text: 'Continue',
                        onPress: () => navigation.push('Mapper', {
                            project,
                        }),
                    },
                ],
            );
        }
    }

    checkWifiDownload(originalTaskAmount) {
        const parent = this;
        return function (taskAmount) {
            if (!GLOBAL.DB.getConnectionManager().isOnline()) {
                Alert.alert(
                    'Warning: You are offline',
                    'Connect to a network and try again',
                    [
                        {
                            text: 'Got it',
                            onPress: () => {
                                console.log('canceled wifi');
                                parent.closeModal3();
                            },
                        },

                    ],
                );
            } else if (GLOBAL.DB.getConnectionManager().isOnWifi()) {
                console.log(`We're headed to download${originalTaskAmount} tasks!`);
                Alert.alert(
                    'Be patient!',
                    'It might take a while for your download to start. ',
                    [
                        {
                            text: 'Ok',
                            onPress: () => {
                                parent.closeModal3();
                            },
                        },
                    ],
                );
                GLOBAL.DB.getTaskGroupsForProject(project.id, -1, originalTaskAmount, project.groupAverage, true);
                parent.closeModal3();
            } else {
                Alert.alert(
                    'Warning: You are not on wifi',
                    'Are you sure you wish to continue this download?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {
                                console.log('canceled wifi');
                                parent.closeModal3();
                            },
                        },
                        {
                            text: 'Continue',
                            onPress: () => {
                                console.log(`We're headed to download${originalTaskAmount} tasks!`);
                                GLOBAL.DB.getTaskGroupsForProject(project.id, -1, originalTaskAmount, project.groupAverage, true);
                                parent.closeModal3();
                            },
                        },
                    ],
                );
            }
        };
    }

    _handleInProgress() {

    }

    _handleRemoval(projectId) {
        return function () {
            const found = GLOBAL.DB.removeOfflineProject(projectId);
            Alert.alert(
                'Deletion Complete',
                `We found ${found} groups in this project and deleted them.`,
                [
                    { text: 'Okay', onPress: () => console.log('closed') },
                    { text: 'Close', onPress: () => console.log('closed') },
                ],
            );
        };
    }

    _handleProjectRemoval(projectId) {
        return function () {
            GLOBAL.DB.removeProject(projectId);
            Alert.alert(
                'Project Reset Complete',
                'Your progress will still be synced! Try Now!',
                [
                    { text: 'Okay', onPress: () => console.log('closed') },
                ],
            );
        };
    }

    render() {
        const { navigation, project } = this.props;
        const renderQueue = [];
        const chunks = project.projectDetails.split('\\n');
        chunks.forEach((chunk) => {
            renderQueue.push(chunk, '\n');
        });

        return (
            <ScrollView style={style.projectViewContainer}>
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
                                        {`${project.progress.toFixed(0)}% GLOBAL PROGRESS BY `}
                                        {`${project.contributors} MAPPERS JUST LIKE YOU.`}
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

                <View style={style.detailContainer}>

                    <Markdown style={style.projectDetails}>
                        {renderQueue}
                    </Markdown>
                    <Button
                        style={style.startButtonTutorial}
                        onPress={() => {
                            navigation.push('WebviewWindow', {
                                uri: GLOBAL.TUT_LINK,
                            });
                        }}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Tutorial
                    </Button>
                    <Button
                        style={style.startButton}
                        onPress={this._handlePress}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Map Now (
                        {this.state.hasOfflineGroups === false ? 'requires network' : 'available offline'}
)
                    </Button>
                    <Button
                        style={this.state.progress === 0 || this.state.progress == 100 ? style.startButton : style.inProgressButton}
                        onPress={this.state.progress === 0 ? this._handleLater : this._handleInProgress}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                        {this.state.progress === 0 || this.state.progress === 100 || !this.state.progress ? 'Download For Later' : `Downloading (${this.state.progress}%)`}
                    </Button>

                    <Button
                        style={style.startButton2}
                        onPress={this._handleProjectRemoval(`project-${project.id}`)}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Bugs? Clear Project Data
                    </Button>

                    {this.state.hasOfflineGroups === true
                        ? (
                            <Button
                                style={style.startButton2}
                                onPress={this._handleRemoval(`project-${project.id}`)}
                                textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                            >
                        Remove Offline Data
                            </Button>
                        ) : null}
                </View>
                <Modal
                    style={[style.modal, style.modal3]}
                    backdropType="blur"
                    position="center"
                    ref="modal3"
                    isDisabled={this.state.isDisabled}
                >
                    <Text style={style.header}>Download Options</Text>
                    <Text style={style.tutPar}>
We will let you know when your download ends, it will be auto-deleted after
                    completion. Do not close the Mapswipe app.
                    </Text>
                    <View style={style.tutRow}><Text style={style.tutText}>About 10 min of mapping</Text></View>
                    <Button
                        style={style.downloadButton}
                        onPress={this.checkWifiDownload(1000)}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Download 1k tiles (approx 20MB)
                    </Button>
                    <View style={style.tutRow}><Text style={style.tutText}>About 40 min of mapping </Text></View>
                    <Button
                        style={style.downloadButton}
                        onPress={this.checkWifiDownload(4000)}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Download 4k tiles (approx 80MB)
                    </Button>
                    <View style={style.tutRow}><Text style={style.tutText}>About 2.5 hrs of mapping</Text></View>
                    <Button
                        style={style.downloadButton}
                        onPress={this.checkWifiDownload(16000)}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    Download 16k tiles (approx 320MB)
                    </Button>
                    <Button
                        style={style.closeButton}
                        onPress={this.closeModal3}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
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
        // project: state.firebase.data.project,
        project: ownProps.project,
    }
);

export const ProjectHeader = compose(
    firebaseConnect(() => [
    ]),
    connect(
        mapStateToProps,
    ),
)(_ProjectHeader);

module.exports = ProjectView;
