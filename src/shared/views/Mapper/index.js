// @flow
/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { BackHandler, Text, View, StyleSheet, Image } from 'react-native';
import Button from 'apsl-react-native-button';
import { Trans, withTranslation } from 'react-i18next';
import { cancelGroup, seenHelpBoxType1, startGroup } from '../../actions';
import {
    firebaseConnectGroup,
    mapStateToPropsForGroups,
} from '../../common/firebaseFunctions';
import Header from '../Header';
import CardBody from './CardBody';
import BottomProgress from '../../common/BottomProgress';
import LoadingIcon from '../LoadingIcon';
import type {
    BuiltAreaGroupType,
    NavigationProp,
    ResultMapType,
    SingleImageryProjectType,
    TranslationFunction,
    TutorialContent,
} from '../../flow-types';
import { COLOR_DEEP_BLUE } from '../../constants';

const Modal = require('react-native-modalbox');
const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
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
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
        marginTop: 5,
    },
    tutRow: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tutPar: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.54)',
        fontWeight: '500',
        lineHeight: 20,
    },
    tutText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#50acd4',
        marginTop: 7,
        marginLeft: 5,
    },
    tutImage: {
        height: 30,
        resizeMode: 'contain',
    },
    tutImage2: {
        height: 30,
        resizeMode: 'contain',
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
    tilePopup: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 300,
        width: 300,
        backgroundColor: 'transparent',
    },
    mappingContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: COLOR_DEEP_BLUE,
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
    },
});

type Props = {
    exampleImage1: string,
    exampleImage2: string,
    group: BuiltAreaGroupType,
    navigation: NavigationProp,
    onCancelGroup: ({}) => void,
    onMarkHelpBoxSeen: (void) => void,
    onStartGroup: ({}) => void,
    results: ResultMapType,
    screens: Array<TutorialContent>,
    hasSeenHelpBoxType1: boolean,
    t: TranslationFunction,
    tutorial: boolean,
    tutorialId: string,
};

type State = {
    poppedUpTile: React.Node,
};

class _Mapper extends React.Component<Props, State> {
    progress: ?BottomProgress;

    project: SingleImageryProjectType;

    tilePopup: ?React.ComponentType<void>;

    HelpModal: ?React.ComponentType<void>;

    constructor(props: Props) {
        super(props);
        this.project = props.navigation.getParam('project', null);
        this.state = {
            poppedUpTile: null,
        };
    }

    componentDidMount() {
        const { hasSeenHelpBoxType1 } = this.props;
        if (hasSeenHelpBoxType1 === undefined) {
            this.openHelpModal();
        }
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate(prevProps) {
        const { group, onStartGroup } = this.props;
        if (group !== undefined && prevProps.group !== group) {
            // we just started working on a group, make a note of the time
            onStartGroup({
                groupId: group.groupId,
                projectId: group.projectId,
                startTime: GLOBAL.DB.getTimestamp(),
            });
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackPress,
        );
    }

    handleBackPress = () => {
        this.returnToView();
        return true;
    };

    openHelpModal = () => {
        // $FlowFixMe
        this.HelpModal.open();
    };

    returnToView = () => {
        const { group, navigation, onCancelGroup } = this.props;
        if (group) {
            onCancelGroup({
                groupId: group.groupId,
                projectId: group.projectId,
            });
            navigation.pop();
        }
    };

    closeHelpModal = () => {
        const { hasSeenHelpBoxType1, onMarkHelpBoxSeen } = this.props;
        if (hasSeenHelpBoxType1 === undefined) {
            onMarkHelpBoxSeen();
        }
        // $FlowFixMe
        this.HelpModal.close();
    };

    openTilePopup = (tile) => {
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

    updateProgress = (progress: number) => {
        if (this.progress) {
            this.progress.updateProgress(progress);
        }
    };

    renderIntroModal(creditString: string) {
        /* eslint-disable global-require */
        const { t, tutorial } = this.props;
        const { ...otherProps } = this.props;
        const projectObj = otherProps.navigation.getParam('project', false);
        let twoTaps;

        if (projectObj.projectType === 4) {
            twoTaps = { twoTaps: t('incomplete') };
        } else {
            twoTaps = { twoTaps: t('maybe') };
        }

        let content;
        if (!tutorial) {
            content = (
                <>
                    <Text style={styles.header}>{t('instructions1')}</Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/tap_icon.png')}
                            style={styles.tutImage}
                        />
                        <Text style={styles.tutText}>{t('instructions2')}</Text>
                    </View>
                    <Text style={styles.tutPar}>
                        <Trans
                            i18nKey="Tutorial:instructions3"
                            values={twoTaps}
                        >
                            Look for features listed in your mission brief. Tap
                            each tile where you find what you&apos;re looking
                            for. Tap once for&nbsp;
                            <Text style={{ color: 'rgb(36, 219, 26)' }}>
                                YES
                            </Text>
                            , twice for&nbsp;
                            <Text style={{ color: 'rgb(237, 209, 28)' }}>
                                {/* $FlowFixMe */}
                                {twoTaps}
                            </Text>
                            , and three times for&nbsp;
                            <Text style={{ color: 'rgb(230, 28, 28)' }}>
                                BAD IMAGERY (such as clouds)
                            </Text>
                            .
                        </Trans>
                    </Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/swipeleft_icon.png')}
                            style={styles.tutImage2}
                        />
                        <Text style={styles.tutText}>{t('instructions4')}</Text>
                    </View>
                    <Text style={styles.tutPar}>{t('instructions5')}</Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/tap_icon.png')}
                            style={styles.tutImage2}
                        />
                        <Text style={styles.tutText}>{t('instructions6')}</Text>
                    </View>
                    <Text style={styles.tutPar}>{t('instructions7')}</Text>
                    <Text style={styles.header}>{t('instructions8')}</Text>
                    <Text style={styles.tutPar}>{creditString}</Text>
                </>
            );
        } else {
            content = (
                <View>
                    <Text style={styles.tutPar}>{t('tutorial1')}</Text>
                    <View style={styles.tutRow}>
                        <Text style={styles.tutPar}>{t('tutorial2')}</Text>
                    </View>
                    <View style={styles.tutRow}>
                        <Text style={styles.tutPar}>{t('tutorial3')}</Text>
                    </View>
                    <View style={styles.tutRow}>
                        <Text style={styles.tutPar}>{t('tutorial4')}</Text>
                    </View>
                </View>
            );
        }

        return (
            <Modal
                style={[styles.modal, styles.HelpModal]}
                backdropType="blur"
                position="center"
                ref={(r) => {
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
                    {t('tutorial5')}
                </Button>
            </Modal>
        );
        /* eslint-enable global-require */
    }

    render() {
        const {
            exampleImage1,
            exampleImage2,
            group,
            navigation,
            results,
            screens,
            tutorial,
            tutorialId,
        } = this.props;
        const { poppedUpTile } = this.state;

        // only show the mapping component once we have downloaded the group data
        if (!group) {
            return <LoadingIcon />;
        }

        // $FlowFixMe
        const creditString =
            this.project.tileServer.credits || 'Unknown imagery source';
        const introModal = this.renderIntroModal(creditString);

        return (
            <View style={styles.mappingContainer}>
                <Header
                    lookFor={this.project.lookFor}
                    onBackPress={this.returnToView}
                    onInfoPress={this.openHelpModal}
                />
                <CardBody
                    closeTilePopup={this.closeTilePopup}
                    exampleImage1={exampleImage1}
                    exampleImage2={exampleImage2}
                    group={group}
                    lookFor={this.project.lookFor}
                    navigation={navigation}
                    openTilePopup={this.openTilePopup}
                    projectId={group.projectId}
                    results={results}
                    screens={tutorial ? screens : null}
                    tileServer={this.project.tileServer}
                    tileServerB={this.project.tileServerB}
                    tutorial={tutorial}
                    tutorialId={tutorialId}
                    updateProgress={this.updateProgress}
                    zoomLevel={this.project.zoomLevel}
                />
                <BottomProgress
                    ref={(r) => {
                        this.progress = r;
                    }}
                />
                {introModal}
                <Modal
                    style={styles.tilePopup}
                    entry="bottom"
                    position="center"
                    ref={(r) => {
                        this.tilePopup = r;
                    }}
                >
                    {poppedUpTile}
                </Modal>
            </View>
        );
    }
    /* eslint-enable global-require */
}

const mapDispatchToProps = (dispatch) => ({
    onCancelGroup(groupDetails) {
        dispatch(cancelGroup(groupDetails));
    },
    onMarkHelpBoxSeen() {
        dispatch(seenHelpBoxType1());
    },
    onStartGroup(groupDetails) {
        dispatch(startGroup(groupDetails));
    },
});

const Mapper = compose(
    withTranslation('Tutorial'),
    firebaseConnectGroup(),
    connect((state) => ({
        hasSeenHelpBoxType1: state.ui.user.hasSeenHelpBoxType1,
    })),
    connect(mapStateToPropsForGroups(), mapDispatchToProps),
)(_Mapper);

// eslint-disable-next-line react/no-multi-comp
export default class MapperScreen extends React.Component<Props> {
    randomSeed: number;

    constructor(props: Props) {
        super(props);
        this.randomSeed = Math.random();
    }

    render() {
        const { ...otherProps } = this.props;
        const projectObj = otherProps.navigation.getParam('project', false);
        // check that the project data has a tutorialId set (in firebase)
        // in which case, we use it as the tutorial (all projects should have one)
        let tutorialId;
        if (projectObj.tutorialId !== undefined) {
            tutorialId = projectObj.tutorialId;
        } else {
            console.warn('No tutorial defined for the project');
            // we should never get to this point, as we catch the lack of tutorial
            // earlier, but just in case: abort and go back to the previous screen,
            // this is a bit ugly, but will prevent a crash for now
            otherProps.navigation.pop();
        }
        return (
            <Mapper
                randomSeed={this.randomSeed}
                tutorialId={tutorialId}
                {...otherProps}
            />
        );
    }
}
