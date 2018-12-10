// @flow
import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import DeviceInfo from 'react-native-device-info';
import { commitGroup, submitFootprint } from '../../actions/index';
import Validator from './Validator';
import LoadMoreCard from '../LoadMore';
import { getSqKmForZoomLevelPerTile } from '../../Database';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
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
    mappingContainer: {
        backgroundColor: '#0d1949',
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
    },
    swipeNavBottom: {
        width: (GLOBAL.SCREEN_WIDTH),
        bottom: 3,
        position: 'absolute',
        left: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#0d1949',
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
});

class BuildingFootprintValidator extends React.Component {
    constructor(props) {
        super(props);
        this.deviceId = DeviceInfo.getUniqueID();
        this.userId = GLOBAL.DB.getAuth().getUser().uid;
        this.project = props.navigation.getParam('project');
        this.state = {
            groupCompleted: false,
        };
    }

    submitFootprintResult = (result, taskId) => {
        const resultObject = {
            id: taskId,
            result,
            projectId: this.project.id,
            item: 'Buildings',
            device: this.deviceId,
            user: GLOBAL.DB.getAuth().getUser().uid,
            timestamp: GLOBAL.DB.getTimestamp(),
            wkt: '',
        };
        this.props.onSubmitFootprint(resultObject);
    }

    commitCompletedGroup = () => {
        this.setState({ groupCompleted: true });
    }

    getContributions = (group, results) => {
        const contributionsCount = Object.keys(results).length;
        const addedDistance = group.count * getSqKmForZoomLevelPerTile(19);
        return { contributionsCount, addedDistance };
    }

    toNextGroup = () => {
        const { navigation } = this.props;
        navigation.navigate('BuildingFootprintValidator', { project: this.project });
    }

    render = () => {
        const { group, navigation } = this.props;
        const { groupCompleted } = this.state;
        if (!group) {
            return null;
        }
        const groupData = group[Object.keys(group)[0]];
        if (groupCompleted) {
            return (
                <LoadMoreCard
                    getContributions={this.getContributions}
                    group={groupData}
                    navigation={navigation}
                    projectId={this.project.id}
                />
            );
        }
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
                        onPress={null}
                    >
                        <Image
                            style={styles.backButton}
                            source={require('../assets/backarrow_icon.png')}
                        />
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.infoButtonContainer} onPress={null}>
                        <Image
                            style={styles.infoButton}
                            source={require('../assets/info_icon.png')}
                        />
                    </TouchableHighlight>
                </View>
                <Validator
                    commitCompletedGroup={this.commitCompletedGroup}
                    group={groupData}
                    project={this.project}
                    submitFootprintResult={this.submitFootprintResult}
                />
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        group: state.firebase.data.group,
        navigation: ownProps.navigation,
        results: state.results,
    }
);

const mapDispatchToProps = dispatch => (
    {
        onCommitGroup(groupInfo) {
            dispatch(commitGroup(groupInfo));
        },
        onSubmitFootprint(resultObject) {
            dispatch(submitFootprint(resultObject));
        },
    }
);

export default compose(
    firebaseConnect(props => [
        {
            path: `groups/${props.navigation.getParam('project').id}`,
            queryParams: ['limitToFirst=1', 'orderByChild=completedCount'],
            storeAs: 'group',
        },
    ]),
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
)(BuildingFootprintValidator);
