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
import { Trans, withTranslation } from 'react-i18next';
import {
    COLOR_DEEP_BLUE,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
} from '../../constants';
import type { NavigationProp, TranslationFunction } from '../../flow-types';
import { NumberedTapIcon } from '../../common/Tutorial/icons';

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
    tutRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tutParagraph: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 10,
    },
    tutText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 5,
        marginTop: 10,
        maxWidth: '85%',
    },
    tutImage: {
        height: 50,
        resizeMode: 'contain',
        width: 50,
    },
});

type Props = {
    navigation: NavigationProp,
    t: TranslationFunction,
};

/* eslint-disable global-require */
class CDInstructionsScreen extends React.Component<Props> {
    componentDidMount() {
        const { navigation } = this.props;
        BackHandler.addEventListener('hardwareBackPress', () =>
            navigation.pop(),
        );
    }

    render() {
        const { navigation, t } = this.props;
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
                    <Text style={styles.header}>{t('your task')}</Text>
                    <Text style={styles.tutParagraph}>
                        <Trans i18nKey="CDInstructionsScreen:lookingFor">
                            You&apos;re looking for{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                changes in buildings
                            </Text>
                            . This acts as a clear indicator for a change in
                            population size.
                        </Trans>
                    </Text>
                    <Text style={styles.header}>{t('perform task')}</Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/swipeleft_icon_white.png')}
                            style={styles.tutImage}
                        />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:noChanges">
                                If there are no changes, simply{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    swipe
                                </Text>{' '}
                                to the next photos
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_GREEN} number="1" />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:seeChanges">
                                If you see a change in buildings,{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    tap once
                                </Text>{' '}
                                and the tile turns green
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_YELLOW} number="2" />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:unsure">
                                Unsure?{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    Tap twice
                                </Text>{' '}
                                and the tile will turn yellow
                            </Trans>
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <NumberedTapIcon bgColor={COLOR_RED} number="3" />
                        <Text style={styles.tutText}>
                            <Trans i18nKey="CDInstructionsScreen:badImagery">
                                Imagery issue, like if either image has clouds
                                covering the view?{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                    Tap three times
                                </Text>{' '}
                                and the tile will turn red
                            </Trans>
                        </Text>
                    </View>

                    <Text style={styles.tutParagraph}>{t('holdZoom')}</Text>

                    <Text style={styles.header}>{t('hint')}</Text>
                    <Text style={styles.tutParagraph}>
                        <Trans i18nKey="CDInstructionsScreen:differentImagery">
                            Sometimes different imagery sources will have been
                            used. The images may be aligned slightly differently
                            or might be a different resolution. Remember,
                            you&apos;re looking for{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                definite changes in settlements and buildings
                            </Text>{' '}
                            so if it looks like the same buildings are there,
                            but maybe there&apos;s a new roof, then this would
                            be a &quot;no change&quot; scenario and you&apos;d
                            simply swipe to the next image.
                        </Trans>
                    </Text>
                    <Text style={styles.header}>&nbsp;</Text>
                </ScrollView>
            </View>
        );
    }
}

export default withTranslation('CDInstructionsScreen')(CDInstructionsScreen);
