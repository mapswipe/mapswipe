// @flow
import * as React from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import Button from 'apsl-react-native-button';
import Modal from 'react-native-modalbox';
import { withTranslation } from 'react-i18next';
import { cancelGroup, startGroup } from '../actions/index';
import {
    firebaseConnectGroup,
    mapStateToPropsForGroups,
} from './firebaseFunctions';
import Header from '../views/Header';
import BackConfirmationModal from './ConfirmationModal';
import BottomProgress from './BottomProgress';
import LoadingIcon from '../views/LoadingIcon';
import LoadMoreCard from '../views/LoadMore';
import type {
    BuildingFootprintProjectType,
    CategoriesType,
    ChangeDetectionProjectType,
    GroupType,
    NavigationProp,
    ResultMapType,
    TranslationFunction,
    TutorialContent,
} from '../flow-types';
import {
    COLOR_DEEP_BLUE,
    BUILDING_FOOTPRINTS,
    // CHANGE_DETECTION,
} from '../constants';

const GLOBAL = require('../Globals');

/* eslint-disable global-require */

const styles = StyleSheet.create({
    mappingContainer: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
        maxHeight: GLOBAL.SCREEN_HEIGHT,
    },
    startButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        alignItems: 'center',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 260,
    },
    modal: {
        padding: 20,
    },
    HelpModal: {
        height: GLOBAL.SCREEN_HEIGHT < 500 ? GLOBAL.SCREEN_HEIGHT - 50 : 500,
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
});

type Props = {
    categories: CategoriesType,
    Component: React.ComponentType<any>,
    group: { [group_id: string]: GroupType },
    navigation: NavigationProp,
    getNormalHelpContent: string => React.ComponentType<any>,
    onCancelGroup: ({}) => void,
    onStartGroup: ({}) => void,
    onSubmitResult: Object => void,
    results: ResultMapType,
    screens: Array<TutorialContent>,
    screenName: string,
    t: TranslationFunction,
    tutorial: boolean,
    tutorialId: string,
    tutorialHelpContent: React.ComponentType<any>,
};

type State = {
    groupCompleted: boolean,
    // only true between the moment the user taps "continue mapping" and the moment
    // the new group has been loaded and is ready to use (this does not mean the imagery
    // is loaded, but most importantly the old group has been replaced, so we can start
    // rendering the component without the risk of showing the group that's already
    // been mapped)
    waitingForNextGroup: boolean,
};

class ProjectLevelScreen extends React.Component<Props, State> {
    backConfirmationModal: ?React.ComponentType<void>;

    HelpModal: ?React.ComponentType<void>;

    progress: ?BottomProgress;

    project: BuildingFootprintProjectType | ChangeDetectionProjectType;

    constructor(props: Props) {
        super(props);
        this.project = props.navigation.getParam('project');
        this.state = {
            groupCompleted: false,
            waitingForNextGroup: false,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate = prevProps => {
        const { group, onStartGroup } = this.props;
        if (prevProps.group !== group) {
            if (isLoaded(group) && !isEmpty(group)) {
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    waitingForNextGroup: false,
                });
                // the component props are updated when group is received
                // and then when tasks are received
                onStartGroup({
                    groupId: group.groupId,
                    projectId: group.projectId,
                    startTime: GLOBAL.DB.getTimestamp(),
                });
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    groupCompleted: false,
                });
                if (this.progress) this.progress.updateProgress(0);
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

    closeHelpModal = () => {
        // $FlowFixMe
        this.HelpModal.close();
    };

    onInfoPress = () => {
        // $FlowFixMe
        this.HelpModal.open();
    };

    completeGroup = () => {
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
        this.setState({ groupCompleted: false, waitingForNextGroup: true });
    };

    updateProgress = (progress: number) => {
        if (this.progress) {
            this.progress.updateProgress(progress);
        }
    };

    renderBackConfirmationModal = () => {
        const { t } = this.props;
        const content = (
            <Text>{t('ProjectLevelScreen:StopMappingAndReturn')}</Text>
        );

        return (
            <BackConfirmationModal
                cancelButtonText={t('ContinueMapping')}
                cancelButtonCallback={() => {
                    // $FlowFixMe
                    this.backConfirmationModal.close();
                }}
                content={content}
                exitButtonText={t('BackToMenu')}
                exitButtonCallback={this.returnToView}
                getRef={r => {
                    this.backConfirmationModal = r;
                }}
            />
        );
    };

    renderHelpModal = () => {
        const {
            getNormalHelpContent,
            t,
            tutorial,
            tutorialHelpContent,
        } = this.props;
        let content = '';
        if (!tutorial) {
            const creditString = this.getCreditString();
            content = getNormalHelpContent(creditString);
        } else {
            content = tutorialHelpContent;
        }

        return (
            <Modal
                style={[styles.modal, styles.HelpModal]}
                backdropType="blur"
                position="center"
                ref={r => {
                    this.HelpModal = r;
                }}
            >
                {content}
                <Button
                    style={styles.startButton}
                    onPress={this.closeHelpModal}
                    testID="closeIntroModalBoxButton"
                    textStyle={{
                        fontSize: 13,
                        color: '#ffffff',
                        fontWeight: '700',
                    }}
                >
                    {t('iUnderstand')}
                </Button>
            </Modal>
        );
    };

    render = () => {
        const {
            categories,
            Component,
            group,
            navigation,
            results,
            screens,
            tutorial,
            tutorialId,
        } = this.props;
        const { groupCompleted, waitingForNextGroup } = this.state;
        if (!group || waitingForNextGroup) {
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
        const helpModal = this.renderHelpModal();
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
                {helpModal}
                <Component
                    categories={tutorial ? categories : null}
                    completeGroup={this.completeGroup}
                    group={group}
                    navigation={navigation}
                    project={this.project}
                    results={results}
                    screens={screens}
                    submitResult={this.submitResult}
                    updateProgress={this.updateProgress}
                    tutorial={tutorial}
                    tutorialId={tutorialId}
                />
                <BottomProgress
                    ref={r => {
                        this.progress = r;
                    }}
                />
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
    withTranslation('ProjectLevelScreen'),
    firebaseConnectGroup(),
    connect(mapStateToPropsForGroups(), mapDispatchToProps),
)(ProjectLevelScreen): any);
