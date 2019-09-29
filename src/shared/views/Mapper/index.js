// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
    BackHandler,
    Text,
    View,
    StyleSheet,
    Image,
} from 'react-native';
import Button from 'apsl-react-native-button';
import { cancelGroup, startGroup } from '../../actions';
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
    CategoriesType,
    NavigationProp,
    ProjectType,
} from '../../flow-types';
import {
    COLOR_DEEP_BLUE,
} from '../../constants';

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
    categories: CategoriesType,
    group: BuiltAreaGroupType,
    navigation: NavigationProp,
    onCancelGroup: {} => void,
    onStartGroup: {} => void,
    tutorial: boolean,
}

type State = {
    poppedUpTile: React.Node,
}

class _Mapper extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.project = props.navigation.getParam('project', null);
        this.state = {
            poppedUpTile: null,
        };
    }

    componentDidMount() {
        this.openHelpModal();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate(prevProps) {
        const { group, onStartGroup } = this.props;
        if (prevProps.group !== undefined && group !== undefined && prevProps.group !== group) {
            // we just started working on a group, make a note of the time
            onStartGroup({
                groupId: group.groupId,
                projectId: group.projectId,
                timestamp: GLOBAL.DB.getTimestamp(),
            });
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.returnToView();
        return true;
    }

    openHelpModal = () => {
        // $FlowFixMe
        this.HelpModal.open();
    }

    returnToView = () => {
        const { group, navigation, onCancelGroup } = this.props;
        if (group) {
            onCancelGroup({
                groupId: group.groupId,
                projectId: group.projectId,
            });
            navigation.pop();
        }
    }

    closeHelpModal = () => {
        // $FlowFixMe
        this.HelpModal.close();
    }

    openTilePopup = (tile) => {
        this.setState({
            poppedUpTile: tile,
        });
        // $FlowFixMe
        this.tilePopup.open();
    }

    closeTilePopup = () => {
        this.setState({
            poppedUpTile: <View />,
        });
        // $FlowFixMe
        this.tilePopup.close();
    }

    progress: ?BottomProgress;

    project: ProjectType;

    tilePopup: ?React.ComponentType<void>;

    HelpModal: ?React.ComponentType<void>;

    renderIntroModal(creditString: string) {
        /* eslint-disable global-require */
        const { tutorial } = this.props;
        let content;
        if (!tutorial) {
            content = (
                <>
                    <Text style={styles.header}>How To Contribute</Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/tap_icon.png')}
                            style={styles.tutImage}
                        />
                        <Text style={styles.tutText}>
                            TAP TO
                            SELECT
                        </Text>
                    </View>
                    <Text style={styles.tutPar}>
                        Look for features listed in your mission brief.
                        Tap each tile where you find what you&apos;re looking for.
                        Tap once for&nbsp;
                        <Text style={{ color: 'rgb(36, 219, 26)' }}>
                            YES
                        </Text>
                        , twice for&nbsp;
                        <Text style={{ color: 'rgb(237, 209, 28)' }}>
                            MAYBE
                        </Text>
                        , and three times for&nbsp;
                        <Text style={{ color: 'rgb(230, 28, 28)' }}>
                            BAD IMAGERY (such as clouds)
                        </Text>
                        .
                    </Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/swipeleft_icon.png')}
                            style={styles.tutImage2}
                        />
                        <Text style={styles.tutText}>
                            SWIPE TO NAVIGATE
                        </Text>
                    </View>
                    <Text style={styles.tutPar}>
                        When you are done with a piece of the map,
                        scroll to the next one by swiping.
                    </Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/tap_icon.png')}
                            style={styles.tutImage2}
                        />
                        <Text style={styles.tutText}>
                            HOLD TO ZOOM
                        </Text>
                    </View>
                    <Text style={styles.tutPar}>Hold a tile to zoom in on the tile.</Text>
                    <Text style={styles.header}>Credits</Text>
                    <Text style={styles.tutPar}>{creditString}</Text>
                </>
            );
        } else {
            content = (
                <View>
                    <Text style={styles.tutPar}>
                        Welcome to the tutorial!
                    </Text>
                    <View style={styles.tutRow}>
                        <Text style={styles.tutPar}>
                            This should make you a wizard of Mapswipe
                            in a few minutes.
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <Text style={styles.tutPar}>
                            Just follow the instructions on the screen,
                            and swipe left to continue.
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <Text style={styles.tutPar}>
                            If the instructions are in your way,
                            just tap the message box to move it.
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <Modal
                style={[styles.modal, styles.HelpModal]}
                backdropType="blur"
                position="center"
                ref={(r) => { this.HelpModal = r; }}
            >
                {content}
                <Button
                    style={styles.startButton}
                    onPress={this.closeHelpModal}
                    testID="closeIntroModalBoxButton"
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    I understand
                </Button>
            </Modal>
        );
        /* eslint-enable global-require */
    }

    render() {
        const {
            categories,
            group,
            navigation,
            tutorial,
        } = this.props;
        const { poppedUpTile } = this.state;
        let comp;
        // only show the mapping component once we have downloaded the group data
        if (group) {
            comp = (
                <CardBody
                    categories={tutorial ? categories : null}
                    group={group}
                    mapper={this}
                    navigation={navigation}
                    projectId={group.projectId}
                    tutorial={tutorial}
                />
            );
        } else {
            comp = <LoadingIcon />;
        }
        // $FlowFixMe
        const creditString = this.project.tileServer.credits || 'Unknown imagery source';
        const introModal = this.renderIntroModal(creditString);

        return (
            <View style={styles.mappingContainer}>
                <Header
                    lookFor={this.project.lookFor}
                    onBackPress={this.returnToView}
                    onInfoPress={this.openHelpModal}
                />

                {comp}

                <BottomProgress ref={(r) => { this.progress = r; }} />
                {introModal}
                <Modal
                    style={styles.tilePopup}
                    entry="bottom"
                    position="center"
                    ref={(r) => { this.tilePopup = r; }}
                >
                    {poppedUpTile}
                </Modal>
            </View>
        );
    }
    /* eslint-enable global-require */
}

const mapDispatchToProps = dispatch => (
    {
        onCancelGroup(groupDetails) {
            dispatch(cancelGroup(groupDetails));
        },
        onStartGroup(groupDetails) {
            dispatch(startGroup(groupDetails));
        },
    }
);

const tutorialName = 'build_area_tutorial';

const Mapper = compose(
    firebaseConnectGroup(tutorialName),
    connect(
        mapStateToPropsForGroups(tutorialName),
        mapDispatchToProps,
    ),
)(_Mapper);

// eslint-disable-next-line react/no-multi-comp
export default class MapperScreen extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.randomSeed = Math.random();
    }

    randomSeed: number;

    render() {
        const { ...otherProps } = this.props;
        return (
            <Mapper
                randomSeed={this.randomSeed}
                {...otherProps}
            />
        );
    }
}
