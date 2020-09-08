// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import fb from 'react-native-firebase';
import { firebaseConnect } from 'react-redux-firebase';
import { StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import Button from 'apsl-react-native-button';
import TutorialOutroScreen from './TutorialOutro';
import { cancelGroup } from '../../actions/index';
import type {
    GroupType,
    NavigationProp,
    TranslationFunction,
} from '../../flow-types';
import { COLOR_DARK_GRAY, COLOR_DEEP_BLUE, COLOR_WHITE } from '../../constants';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    congratulationsSlide: {
        width: GLOBAL.SCREEN_WIDTH,
        height: '100%',
        borderWidth: 0,
        backgroundColor: COLOR_DARK_GRAY,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    moreButton: {
        backgroundColor: COLOR_DEEP_BLUE,
        marginTop: 20,
        width: '70%',
        marginLeft: '15%',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    finishedText: {
        textAlign: 'center',
        color: COLOR_WHITE,
        marginBottom: 10,
        width: '70%',
    },
    oneScreenWidth: {
        width: GLOBAL.SCREEN_WIDTH,
    },
    twoScreensWidth: {
        flex: 1,
        flexDirection: 'row',
        width: GLOBAL.SCREEN_WIDTH * 2,
    },
});

type Props = {
    group: GroupType,
    navigation: NavigationProp,
    onCancelGroup: ({}) => void,
    projectId: string,
    t: TranslationFunction,
};

class TutorialEndScreen extends React.Component<Props> {
    onComplete = () => {
        const { group, navigation, onCancelGroup } = this.props;
        fb.analytics().logEvent('finish_tutorial');
        // this prevents the tutorial from showing
        // results from a previous run
        onCancelGroup({
            groupId: group.groupId,
            projectId: group.projectId,
        });
        navigation.pop();
    };

    _onBack = () => {
        const { navigation } = this.props;
        navigation.pop();
    };

    render() {
        const { t } = this.props;
        return (
            <View style={styles.twoScreensWidth}>
                <View style={styles.oneScreenWidth}>
                    <TutorialOutroScreen />
                </View>
                <View style={styles.oneScreenWidth}>
                    <View style={styles.congratulationsSlide}>
                        <Text style={styles.finishedText}>
                            {t('completedTutorial')}
                        </Text>

                        <Button
                            style={styles.moreButton}
                            onPress={this.onComplete}
                            textStyle={{ fontSize: 18, color: COLOR_WHITE }}
                        >
                            {t('letsGo')}
                        </Button>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    navigation: ownProps.navigation,
    results: state.results,
});

const mapDispatchToProps = (dispatch) => ({
    onCancelGroup(groupDetails) {
        dispatch(cancelGroup(groupDetails));
    },
});

export default compose(
    withTranslation('TutorialEndScreen'),
    firebaseConnect(),
    connect(mapStateToProps, mapDispatchToProps),
)(TutorialEndScreen);
