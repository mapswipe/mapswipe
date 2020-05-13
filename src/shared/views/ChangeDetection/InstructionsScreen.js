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
import {
    COLOR_DEEP_BLUE,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
} from '../../constants';
import type { NavigationProp } from '../../flow-types';

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

type IconProps = {
    bgColor: string,
    number: string,
};

type Props = {
    navigation: NavigationProp,
};

/* eslint-disable global-require */
const ColoredTapIcon = (props: IconProps) => {
    const { bgColor, number } = props;
    return (
        <View>
            <Image
                source={require('../assets/tap_icon_angular_white.png')}
                style={styles.tutImage}
            />
            <Text
                style={{
                    color: COLOR_WHITE,
                    backgroundColor: bgColor,
                    borderRadius: 10,
                    fontWeight: 'bold',
                    left: 30,
                    paddingLeft: 5,
                    position: 'absolute',
                    width: 18,
                }}
            >
                {number}
            </Text>
        </View>
    );
};

export default class CDInstructionsScreen extends React.Component<Props> {
    componentDidMount() {
        const { navigation } = this.props;
        BackHandler.addEventListener('hardwareBackPress', () =>
            navigation.pop(),
        );
    }

    render() {
        const { navigation } = this.props;
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
                        Instructions
                    </Text>
                </View>

                <ScrollView style={styles.container}>
                    <Text style={styles.header}>Your task:</Text>
                    <Text style={styles.tutParagraph}>
                        You&apos;re looking for{' '}
                        <Text style={{ fontWeight: 'bold' }}>
                            changes in buildings
                        </Text>
                        . This acts as a clear indicator for a change in
                        population size.
                    </Text>
                    <Text style={styles.header}>How to perform the task:</Text>
                    <View style={styles.tutRow}>
                        <Image
                            source={require('../assets/swipeleft_icon_white.png')}
                            style={styles.tutImage}
                        />
                        <Text style={styles.tutText}>
                            If there are no changes, simply{' '}
                            <Text style={{ fontWeight: 'bold' }}>swipe</Text> to
                            the next photos
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <ColoredTapIcon bgColor={COLOR_GREEN} number="1" />
                        <Text style={styles.tutText}>
                            If you see a change in buildings,{' '}
                            <Text style={{ fontWeight: 'bold' }}>tap once</Text>{' '}
                            and the tile turns green
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <ColoredTapIcon bgColor={COLOR_YELLOW} number="2" />
                        <Text style={styles.tutText}>
                            Unsure?{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                Tap twice
                            </Text>{' '}
                            and the tile will turn yellow
                        </Text>
                    </View>
                    <View style={styles.tutRow}>
                        <ColoredTapIcon bgColor={COLOR_RED} number="3" />
                        <Text style={styles.tutText}>
                            Imagery issue, like if either image has clouds
                            covering the view?{' '}
                            <Text style={{ fontWeight: 'bold' }}>
                                Tap three times
                            </Text>{' '}
                            and the tile will turn red
                        </Text>
                    </View>

                    <Text style={styles.tutParagraph}>
                        If you need to see an image more closely, tap and hold
                        the image and it&apos;ll zoom in a little more.
                    </Text>

                    <Text style={styles.header}>Hint:</Text>
                    <Text style={styles.tutParagraph}>
                        Sometimes different imagery sources will have been used.
                        The images may be aligned slightly differently or might
                        be a different resolution. Remember, you&apos;re looking
                        for{' '}
                        <Text style={{ fontWeight: 'bold' }}>
                            definite changes in settlements and buildings
                        </Text>{' '}
                        so if it looks like the same buildings are there, but
                        maybe there&apos;s a new roof, then this would be a
                        &quot;no change&quot; scenario and you&apos;d simply
                        swipe to the next image.
                    </Text>
                    <Text style={styles.header}>&nbsp;</Text>
                </ScrollView>
            </View>
        );
    }
}
