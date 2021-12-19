// @flow
import * as React from 'react';
import {
    Alert,
    Text,
    View,
    StyleSheet,
    Image,
    TouchableHighlight,
    TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const GLOBAL = require('../Globals');

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
        width: GLOBAL.SCREEN_WIDTH,
        flexShrink: 1,
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
    lookFor: string,
    onBackPress: () => void,
    onInfoPress?: () => void,
    overrideText?: string,
};

const onPressDebugBox = () => {
    Alert.alert(
        'Debug Info',
        `TILE_VIEW_HEIGHT: ${GLOBAL.TILE_VIEW_HEIGHT}
         SCREEN_WIDTH: ${GLOBAL.SCREEN_WIDTH}
         SCREEN_HEIGHT: ${GLOBAL.SCREEN_HEIGHT}
         TILE_SIZE: ${GLOBAL.TILE_SIZE}
         `,
    );
};

/* eslint-disable global-require */
const Header = (props: Props): React.Node => {
    const { lookFor, onBackPress, onInfoPress, overrideText } = props;
    const { t } = useTranslation('mappingHeader');
    return (
        <View style={styles.swipeNavTop}>
            <TouchableWithoutFeedback onLongPress={onPressDebugBox}>
                <View
                    style={{
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    {overrideText && (
                        <Text style={styles.topText}>{overrideText}</Text>
                    )}
                    {!overrideText && (
                        <>
                            <Text style={styles.topText}>
                                {t('youAreLookingFor')}
                            </Text>
                            <Text style={styles.elementText}>{lookFor}</Text>
                        </>
                    )}
                </View>
            </TouchableWithoutFeedback>
            <TouchableHighlight
                style={styles.backButtonContainer}
                onPress={onBackPress}
            >
                <Image
                    style={styles.backButton}
                    source={require('./assets/backarrow_icon.png')}
                />
            </TouchableHighlight>

            <TouchableHighlight
                style={styles.infoButtonContainer}
                onPress={onInfoPress}
            >
                <Image
                    style={styles.infoButton}
                    source={require('./assets/info_icon.png')}
                />
            </TouchableHighlight>
        </View>
    );
};

Header.defaultProps = {
    onInfoPress: (): void => undefined,
};

export default Header;
