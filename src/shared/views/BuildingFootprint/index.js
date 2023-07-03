// @flow
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import ProjectLevelScreen from '../../common/ProjectLevelScreen';
import { submitFootprint } from '../../actions/index';
import Validator from './Validator';
import type {
    NavigationProp,
    TranslationFunction,
    Option,
} from '../../flow-types';
import { COLOR_LIGHT_GRAY } from '../../constants';
import * as SvgIcons from '../../common/SvgIcons';
import { toCamelCase } from '../../common/Tutorial';

const styles = StyleSheet.create({
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    tutRow: {
        marginTop: 10,
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
    svgIcon: {
        borderRadius: 30,
        height: 30,
        width: 30,
    },
    textContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
    },
    textTitle: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 10,
        maxWidth: '85%',
        width: '85%',
    },
    textDescription: {
        color: COLOR_LIGHT_GRAY,
        fontSize: 15,
        fontWeight: '400',
        marginLeft: 10,
        maxWidth: '85%',
        width: '85%',
    },
});

type Props = {
    navigation: NavigationProp,
    t: TranslationFunction,
};

/* eslint-disable react/destructuring-assignment */
class _BuildingFootprintScreen extends React.Component<Props> {
    randomSeed: number;

    constructor(props: Object) {
        super(props);
        // this random value is used to pick a group when mapping starts,
        // it cannot be picked within mapStateToProps, as the latter must be
        // a pure function (adding randomness in it causes an infinite loop
        // of rendering). Here seems like a good place, as it is set once
        // for the lifetime of the component.
        this.randomSeed = Math.random();
    }

    /* eslint-disable global-require */
    getNormalHelpContent = (_, customOptions: Option[]) => {
        const { t } = this.props;
        return (
            <>
                <Text style={styles.header}>TThis is good</Text>
                <View style={styles.tutRow}>
                    <Text style={styles.tutPar}>
                        {t('squareContainsBuildings')}
                    </Text>
                </View>
                {customOptions?.map(item => (
                    <View style={styles.tutRow} key={item.value}>
                        <View
                            style={[
                                styles.svgIcon,
                                { backgroundColor: item.iconColor },
                            ]}
                        >
                            <SvgXml
                                xml={
                                    SvgIcons[toCamelCase(item.icon)] ??
                                    SvgIcons.removeOutline
                                }
                                width="100%"
                                height="100%"
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.textTitle}>{item.title}</Text>
                            <Text style={styles.textDescription}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </>
        );
    };

    /* eslint-enable global-require */
    render() {
        const { navigation, t, ...otherProps } = this.props;
        const projectObj = navigation.getParam('project', false);
        const tutorial = navigation.getParam('tutorial', false);
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
            navigation.pop();
        }
        return (
            <ProjectLevelScreen
                Component={Validator}
                navigation={navigation}
                getNormalHelpContent={this.getNormalHelpContent}
                headerText={t('doesShapeOutlineABuilding')}
                randomSeed={this.randomSeed}
                screenName="BuildingFootprintScreen"
                submitResultFunction={submitFootprint}
                tutorial={tutorial}
                tutorialId={tutorialId}
                {...otherProps}
            />
        );
    }
}

export default (withTranslation('BFInstructionsScreen')(
    _BuildingFootprintScreen,
): any);
