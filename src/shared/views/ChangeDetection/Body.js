// @flow
import * as React from 'react';
import {
    BackHandler,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { withTranslation } from 'react-i18next';
import Modal from 'react-native-modalbox';
import { SvgXml } from 'react-native-svg';
import { cancelGroup, startGroup } from '../../actions/index';
import {
    firebaseConnectGroup,
    mapStateToPropsForGroups,
} from '../../common/firebaseFunctions';
import Header from '../Header';
import BackConfirmationModal from '../../common/ConfirmationModal';
import Button from '../../common/Button';
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
import { hideIconFill } from '../../common/SvgIcons';

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
    iconContainer: {
        width: 24,
        height: 24,
        bottom: 10,
        right: 20,
        position: 'absolute',
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
    canContinueMapping: boolean,
    informationPages?: Array<any>,
};

type State = {
    groupCompleted: boolean,
    poppedUpTile: React.Node,
    hideIcons: boolean,
    showBackModal: boolean,
    visibleAccessibility: boolean,
};

class _ChangeDetectionBody extends React.Component<Props, State> {
    currentX: number;

    backConfirmationModal: ?React.ComponentType<void>;

    HelpModal: ?React.ComponentType<void>;

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
            hideIcons: false,
            showBackModal: false,
            visibleAccessibility: false,
        };
    }

    async componentDidMount() {
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackPress,
        );
        const userId = auth().currentUser?.uid;

        try {
            await database()
                .ref(`/v2/users/${userId}/accessibility`)
                .once('value', snapshot => {
                    this.setState({ visibleAccessibility: snapshot.val() });
                });
        } catch {
            console.log('User not found');
        }
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
                if (group.tasks !== undefined) {
                    // eslint-disable-next-line react/no-did-update-set-state
                    this.setState({ groupCompleted: false });
                    if (this.progress) this.progress.updateProgress(0);
                }
            }
        }
    };

    componentWillUnmount() {
        if (this.backHandler) {
            this.backHandler.remove();
        }
    }

    handleBackPress = () => {
        // $FlowFixMe
        this.handleBackModalVisibilityChange(true);
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
        const { navigation, informationPages } = this.props;

        navigation.push('CDInstructionsScreen', { informationPages });
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
                    this.project.tileServerA.credits || defaultCredits;
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

    onPressHideIconIn = () => {
        this.setState({ hideIcons: true });
    };

    onPressHideIconOut = () => {
        this.setState({ hideIcons: false });
    };

    handleBackModalVisibilityChange = newVal => {
        this.setState({ showBackModal: newVal });
    };

    handleBackClick = () => {
        const { navigation } = this.props;
        navigation.pop();
    };

    renderBackConfirmationModal = () => {
        const { t } = this.props;
        const { showBackModal } = this.state;
        const content = (
            <Text>{t('ProjectLevelScreen:StopMappingAndReturn')}</Text>
        );

        return (
            <BackConfirmationModal
                cancelButtonText={t('ProjectLevelScreen:ContinueMapping')}
                cancelButtonCallback={() => {
                    // $FlowFixMe
                    this.handleBackModalVisibilityChange(false);
                }}
                content={content}
                exitButtonText={t('ProjectLevelScreen:BackToMenu')}
                exitButtonCallback={this.returnToView}
                isVisible={showBackModal}
            />
        );
    };

    render = () => {
        const {
            group,
            navigation,
            results,
            screens,
            t,
            tutorial,
            tutorialId,
            canContinueMapping,
            informationPages,
        } = this.props;
        const {
            groupCompleted,
            poppedUpTile,
            hideIcons,
            visibleAccessibility,
        } = this.state;

        if (!group) {
            return (
                <LoadingIcon
                    label="Loading groups"
                    actions={
                        <View style={{ marginTop: 30 }}>
                            <Text>
                                In case you’re stuck here for too long, go back
                                to home page.
                            </Text>
                            <Button
                                style={{
                                    alignSelf: 'center',
                                    backgroundColor: COLOR_DEEP_BLUE,
                                    marginTop: 16,
                                    width: GLOBAL.SCREEN_WIDTH * 0.6,
                                }}
                                onPress={this.handleBackClick}
                            >
                                Go back
                            </Button>
                        </View>
                    }
                />
            );
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

        return (
            <View style={styles.mappingContainer}>
                <Header
                    lookFor={this.project.lookFor}
                    overrideText={this.project.projectInstruction}
                    onBackPress={() => {
                        // $FlowFixMe
                        this.handleBackModalVisibilityChange(true);
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
                    canContinueMapping={canContinueMapping}
                    hideIcons={hideIcons}
                    visibleAccessibility={visibleAccessibility}
                />
                <View>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            navigation.push('CDInstructionsScreen', {
                                informationPages,
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
                    <TouchableOpacity
                        onPressIn={this.onPressHideIconIn}
                        onPressOut={this.onPressHideIconOut}
                        style={styles.iconContainer}
                    >
                        <SvgXml width={24} xml={hideIconFill} />
                    </TouchableOpacity>
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
