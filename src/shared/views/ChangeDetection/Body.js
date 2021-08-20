// @flow
import * as React from 'react';
import {
    BackHandler,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import { withTranslation } from 'react-i18next';
import Modal from 'react-native-modalbox';
import { cancelGroup, startGroup } from '../../actions/index';
import {
    firebaseConnectGroup,
    mapStateToPropsForGroups,
} from '../../common/firebaseFunctions';
import Header from '../Header';
import BackConfirmationModal from '../../common/ConfirmationModal';
import BottomProgress from '../../common/BottomProgress';
import LoadingIcon from '../LoadingIcon';
import LoadMoreCard from '../LoadMore';
import TaskList from './TaskList';
import type {
    ChangeDetectionGroupType,
    NavigationProp,
    ProjectType,
    ResultMapType,
    TranslationFunction,
    TutorialContent,
} from '../../flow-types';
import {
    COLOR_DEEP_BLUE,
    BUILDING_FOOTPRINTS,
    // CHANGE_DETECTION,
} from '../../constants';

const GLOBAL = require('../../Globals');

/* eslint-disable global-require */

const styles = StyleSheet.create({
    mappingContainer: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    tilePopup: {
        // Make sure that popped up tile is displayed in
        // the center of the screen
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});

type Props = {
    screens: Array<TutorialContent>,
    group: ChangeDetectionGroupType,
    navigation: NavigationProp,
    onCancelGroup: ({ groupId: string, projectId: string }) => void,
    onStartGroup: ({
        groupId: string,
        projectId: string,
        startTime: string,
    }) => void,
    onSubmitResult: Object => void,
    results: ResultMapType,
    screenName: string,
    t: TranslationFunction,
    tutorial: boolean,
    tutorialId: string,
};

type State = {
    groupCompleted: boolean,
    poppedUpTile: React.Node,
};

class _ChangeDetectionBody extends React.Component<Props, State> {
    currentX: number;

    backConfirmationModal: ?React.ComponentType<void>;

    progress: ?BottomProgress;

    project: ProjectType;

    tilePopup: ?React.ComponentType<void>;

    constructor(props: Props) {
        super(props);
        this.project = props.navigation.getParam('project');
        // the number of screens that the initial tutorial intro covers
        this.state = {
            groupCompleted: false,
            poppedUpTile: null,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate = prevProps => {
        const { group, onStartGroup } = this.props;
        if (prevProps.group !== group) {
            if (isLoaded(group) && !isEmpty(group)) {
                // the component props are updated when group is received
                // and then when tasks are received
                // we run the START_GROUP event before receiving the tasks
                // to prevent a weird bug where the tasks are received before
                // the group when reopening the project
                onStartGroup({
                    groupId: group.groupId,
                    projectId: group.projectId,
                    startTime: GLOBAL.DB.getTimestamp(),
                });
                console.log('start time:');
                console.log(GLOBAL.DB.getTimestamp());
                if (group.tasks !== undefined) {
                    // eslint-disable-next-line react/no-did-update-set-state
                    this.setState({ groupCompleted: false });
                    if (this.progress) this.progress.updateProgress(0);
                }
            }
        }
    };

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackPress,
        );
    }

    handleBackPress = () => {
        // $FlowFixMe
        this.backConfirmationModal.open();
        return true; // prevents the navigator from jumping back
    };

    returnToView = () => {
        const { group, navigation, onCancelGroup } = this.props;
        // TODO: this will not work with offline preloading of multiple groups
        // as several groups will be stored in redux, possibly with clashing groupId
        onCancelGroup({
            groupId: group.groupId,
            projectId: group.projectId,
        });
        navigation.pop();
    };

    submitResult = (result: number, taskId) => {
        const { group, onSubmitResult } = this.props;
        const resultObject = {
            resultId: taskId,
            result,
            groupId: group.groupId,
            projectId: this.project.projectId,
        };
        onSubmitResult(resultObject);
    };

    onInfoPress = () => {
        const { navigation } = this.props;
        const creditString = this.getCreditString();

        console.log('Credits in get info press ', creditString)

        navigation.push('CDInstructionsScreen', {
            project: this.project,
            creditString: this.getCreditString()
        });
    };

    commitCompletedGroup = () => {
        this.setState({ groupCompleted: true });
    };

    getCreditString = (): string => {
        let result = '';
        const defaultCredits = 'Unknown imagery source';
        switch (this.project.projectType) {
            // FIXME: for some reason, flow doesn't like the constant being used here
            case 3: {
                // CHANGE_DETECTION
                // we have 2 sets of imagery
                const creditsA =
                    this.project.tileServer.credits || defaultCredits;
                const creditsB =
                    this.project.tileServerB.credits || defaultCredits;
                result = `Before: ${creditsA}\nAfter: ${creditsB}`;
                break;
            }
            case BUILDING_FOOTPRINTS: {
                result = this.project.tileServer.credits || defaultCredits;
                break;
            }
            default:
                result = defaultCredits;
        }
        return result;
    };

    toNextGroup = () => {
        const { navigation, screenName } = this.props;
        navigation.navigate(screenName, { project: this.project });
    };

    updateProgress = (progress: number) => {
        if (this.progress) {
            this.progress.updateProgress(progress);
        }
    };

    openTilePopup = tile => {
        console.log('open tile popup');
        console.log(tile);
        this.setState({
            poppedUpTile: tile,
        });
        // $FlowFixMe
        this.tilePopup.open();
    };

    closeTilePopup = () => {
        this.setState({
            poppedUpTile: <View />,
        });
        // $FlowFixMe
        this.tilePopup.close();
    };

    renderBackConfirmationModal = () => {
        const { t } = this.props;
        const content = (
            <Text>{t('ProjectLevelScreen:StopMappingAndReturn')}</Text>
        );

        return (
            <BackConfirmationModal
                cancelButtonText={t('ProjectLevelScreen:ContinueMapping')}
                cancelButtonCallback={() => {
                    // $FlowFixMe
                    this.backConfirmationModal.close();
                }}
                content={content}
                exitButtonText={t('ProjectLevelScreen:BackToMenu')}
                exitButtonCallback={this.returnToView}
                getRef={r => {
                    this.backConfirmationModal = r;
                }}
            />
        );
    };

    render = () => {
        const { group, navigation, results, screens, t, tutorial, tutorialId } =
            this.props;
        const { groupCompleted, poppedUpTile } = this.state;

        if (!group) {
            console.log('no group information available.');
            return <LoadingIcon />;
        }

        if (groupCompleted) {
            return (
                <LoadMoreCard
                    group={group}
                    navigation={navigation}
                    projectId={group.projectId}
                    toNextGroup={this.toNextGroup}
                    tutorial={tutorial}
                />
            );
        }
        const backConfirmationModal = this.renderBackConfirmationModal();
        const creditString = this.getCreditString();

        return (
            <View style={styles.mappingContainer}>
                <Header
                    lookFor={this.project.lookFor}
                    onBackPress={() => {
                        // $FlowFixMe
                        this.backConfirmationModal.open();
                    }}
                    onInfoPress={this.onInfoPress}
                />
                {backConfirmationModal}
                <TaskList
                    screens={tutorial ? screens : null}
                    commitCompletedGroup={this.commitCompletedGroup}
                    group={group}
                    navigation={navigation}
                    project={this.project}
                    results={results}
                    submitResult={this.submitResult}
                    updateProgress={this.updateProgress}
                    tutorial={tutorial}
                    tutorialId={tutorialId}
                    closeTilePopup={this.closeTilePopup}
                    openTilePopup={this.openTilePopup}
                    zoomLevel={this.project.zoomLevel}
                />
                <View>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            navigation.push('CDInstructionsScreen', {
                                project: this.project,
                                creditString: creditString
                            });
                        }}
                    >
                        <Text
                            style={{
                                alignSelf: 'center',
                                color: 'white',
                                marginTop: 2,
                                marginBottom: 2,
                            }}
                        >
                            {t('viewInstructions')}
                        </Text>
                    </TouchableWithoutFeedback>
                </View>
                <BottomProgress
                    ref={r => {
                        this.progress = r;
                    }}
                />
                <Modal
                    style={styles.tilePopup}
                    entry="bottom"
                    position="center"
                    ref={r => {
                        this.tilePopup = r;
                    }}
                >
                    {poppedUpTile}
                </Modal>
            </View>
        );
    };
}

const mapDispatchToProps = (dispatch, ownProps) => ({
    onCancelGroup(groupDetails) {
        dispatch(cancelGroup(groupDetails));
    },
    onStartGroup(groupDetails) {
        dispatch(startGroup(groupDetails));
    },
    onSubmitResult(resultObject) {
        dispatch(ownProps.submitResultFunction(resultObject));
    },
});

export default (compose(
    withTranslation('CDBodyScreen'),
    firebaseConnectGroup(),
    connect(mapStateToPropsForGroups(), mapDispatchToProps),
)(_ChangeDetectionBody): any);
