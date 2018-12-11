// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableHighlight,
} from 'react-native';
import Button from 'apsl-react-native-button';
import CardBody from './CardBody';
import BottomProgress from './BottomProgress';
import type { NavigationProp, ProjectType } from '../../flow-types';

const Modal = require('react-native-modalbox');
const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    startButton: {
        backgroundColor: '#0d1949',
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
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    tutRow: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: 40,
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
        marginTop: 10,
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
    tutorialModal: {
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
        backgroundColor: '#0d1949',
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
    },
    backButton: {
        width: 20,
        height: 20,
    },
    backButtonContainer: {
        width: 40,
        height: 40,
        top: 0,
        padding: 10,
        left: 0,
        position: 'absolute',
    },
    infoButton: {
        width: 20,
        height: 20,
    },
    infoButtonContainer: {
        width: 20,
        height: 20,
        top: 10,
        right: 20,
        position: 'absolute',
    },
    swipeNavTop: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: 40,
    },
    topText: {
        justifyContent: 'center',
        color: '#ffffff',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 1,
        backgroundColor: 'transparent',
    },
    elementText: {
        justifyContent: 'center',
        color: '#ffffff',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 2,
        fontSize: 11,
        fontWeight: '700',
        backgroundColor: 'transparent',
    },
});

type Props = {
    navigation: NavigationProp,
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
        this.openTutorialModal();
        // GLOBAL.ANALYTICS.logEvent('mapping_started');
    }

    openTutorialModal = () => {
        // $FlowFixMe
        this.TutorialModal.open();
    }

    returnToView = () => {
        const { navigation } = this.props;
        navigation.pop();
    }

    closeTutorialModal = () => {
        // $FlowFixMe
        this.TutorialModal.close();
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

    progress: ?React.Ref<typeof BottomProgress>;

    project: ProjectType;

    tilePopup: ?React.ComponentType<void>;

    TutorialModal: ?React.ComponentType<void>;

    render() {
        /* eslint-disable global-require */
        const { navigation } = this.props;
        const { poppedUpTile } = this.state;
        return (
            <View style={styles.mappingContainer}>
                <View style={styles.swipeNavTop}>
                    <Text style={styles.topText}>
                    You are looking for:
                    </Text>
                    <Text style={styles.elementText}>
                        {this.project.lookFor}
                    </Text>
                    <TouchableHighlight
                        style={styles.backButtonContainer}
                        onPress={this.returnToView}
                    >
                        <Image
                            style={styles.backButton}
                            source={require('../assets/backarrow_icon.png')}
                        />
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={styles.infoButtonContainer}
                        onPress={this.openTutorialModal}
                    >
                        <Image
                            style={styles.infoButton}
                            source={require('../assets/info_icon.png')}
                        />
                    </TouchableHighlight>
                </View>

                <CardBody
                    projectId={this.project.id}
                    mapper={this}
                    navigation={navigation}
                />
                <BottomProgress ref={(r) => { this.progress = r; }} />
                <Modal
                    style={[styles.modal, styles.tutorialModal]}
                    backdropType="blur"
                    position="center"
                    ref={(r) => { this.TutorialModal = r; }}
                >
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
Search the image for features listed in your mission brief. Tap each tile
                    where you find what you&apos;re looking for. Tap once for
                        <Text style={{ color: 'rgb(36, 219, 26)' }}>
                            YES
                        </Text>
                        , twice for
                        <Text style={{ color: 'rgb(237, 209, 28)' }}>
                            MAYBE
                        </Text>
                        , and three times for
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
SWIPE TO
                    NAVIGATE
                        </Text>
                    </View>
                    <Text style={styles.tutPar}>
When you feel confident you are done with a piece of the map, scroll to the
                    next one by simply swiping.
                    </Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/tap_icon.png')}
                            style={styles.tutImage2}
                        />
                        <Text style={styles.tutText}>
HOLD TO
                    ZOOM
                        </Text>
                    </View>
                    <Text style={styles.tutPar}>Hold a tile to zoom in on the tile.</Text>
                    <Button
                        style={styles.startButton}
                        onPress={this.closeTutorialModal}
                        textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                    >
                    I understand
                    </Button>
                </Modal>
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

const mapStateToProps = (state, ownProps) => (
    {
        navigation: ownProps.navigation,
    }
);

// Mapper
export default compose(
    firebaseConnect(() => [
    ]),
    connect(
        mapStateToProps,
    ),
)(_Mapper);
