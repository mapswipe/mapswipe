// @flow
import * as React from 'react';
import {
    BackHandler,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';
import { withTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import {
    COLOR_DEEP_BLUE,
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
} from '../../constants';
import type {
    NavigationProp,
    TranslationFunction,
    Option,
} from '../../flow-types';
import * as SvgIcons from '../../common/SvgIcons';
import { toCamelCase } from '../../common/Tutorial';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    backButton: {
        width: 20,
        height: 20,
    },
    backButtonContainer: {
        width: 60,
        height: 60,
        top: 0,
        padding: 20,
        left: 0,
        position: 'absolute',
    },
    background: {
        backgroundColor: COLOR_DEEP_BLUE,
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
    container: {
        paddingHorizontal: 20,
    },
    header: {
        color: COLOR_WHITE,
        fontWeight: '700',
        fontSize: 18,
        marginTop: 20,
    },
    swipeNavTop: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 60,
        backgroundColor: COLOR_DEEP_BLUE,
    },
    tutText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 5,
        marginTop: 10,
        maxWidth: '85%',
    },
    tutRow: {
        paddingBottom: 10,
        paddingTop: 10,
        flexDirection: 'row',
    },
    svgIcon: {
        borderRadius: 25,
        height: 50,
        padding: 10,
        width: 50,
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

/* eslint-disable global-require */
class BFInstructionScreen extends React.Component<Props> {
    componentDidMount() {
        const { navigation } = this.props;
        BackHandler.addEventListener('hardwareBackPress', () =>
            navigation.pop(),
        );
    }

    render() {
        const { navigation, t } = this.props;
        const { customOptions } = navigation.state.params;
        return (
            <View style={styles.background}>
                <View style={styles.swipeNavTop}>
                    <TouchableHighlight
                        style={styles.backButtonContainer}
                        onPress={() => navigation.pop()}
                    >
                        <Image
                            style={styles.backButton}
                            source={require('../assets/backarrow_icon.png')}
                        />
                    </TouchableHighlight>
                    <Text
                        style={[
                            styles.header,
                            { alignSelf: 'center', marginTop: 15 },
                        ]}
                    >
                        {t('instructions')}
                    </Text>
                </View>

                <ScrollView style={styles.container}>
                    <Text style={[styles.tutText, { marginLeft: 0 }]}>
                        {t('useTheButtonsToAnswer')}
                    </Text>
                    <Text style={styles.header}>
                        {t('doesTheShapeOutlineABuilding')}
                    </Text>
                    {(customOptions: Option[])?.map(item => (
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
                                <Text style={styles.textTitle}>
                                    {item.title}
                                </Text>
                                <Text style={styles.textDescription}>
                                    {item.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }
}

// $FlowFixMe
export default withTranslation('ImageValidationTutorialIntroScreen')(
    BFInstructionScreen,
);
