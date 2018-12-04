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
import Validator from './Validator';

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
        this.project = props.navigation.getParam('project');
    }

    render = () => {
        const { group } = this.props;
        console.log('BV', this.props);
        if (!group) {
            return null;
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
                    group={group[Object.keys(group)[0]]}
                    project={this.project}
                />
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        group: state.firebase.data.group,
        navigation: ownProps.navigation,
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
    ),
)(BuildingFootprintValidator);
