import * as React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Button from './Button';
import { COLOR_LIGHT_GRAY } from '../../constants';

const styles = StyleSheet.create({
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    tabs: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#ccc',
    },
});

type Props = {
    activeTab: number,
    backgroundColor: string,
    containerWidth: number,
    goToPage: () => any,
    scrollValue: any,
    style: any,
    tabBarUnderlineStyle: any,
    tabs: Array,
};

class DefaultTabBar extends React.Component<Props> {
    renderTab = (name, page, isTabActive, onPressHandler) => {
        const textColor = isTabActive ? 'white' : COLOR_LIGHT_GRAY;
        const fontWeight = isTabActive ? 'bold' : 'normal';

        return (
            <Button
                style={{ flex: 1 }}
                key={name}
                accessible
                accessibilityLabel={name}
                accessibilityTraits="button"
                onPress={() => onPressHandler(page)}
            >
                <View style={[styles.tab, { borderBottomWidth: 0 }]}>
                    <Text style={[{ color: textColor, fontWeight }, {}]}>
                        {name}
                    </Text>
                </View>
            </Button>
        );
    };

    render() {
        const {
            activeTab,
            backgroundColor,
            containerWidth,
            goToPage,
            scrollValue,
            style,
            tabBarUnderlineStyle,
            tabs,
        } = this.props;
        const numberOfTabs = tabs.length;
        const tabUnderlineStyle = {
            position: 'absolute',
            width: containerWidth / numberOfTabs,
            height: 4,
            bottom: 0,
        };

        const translateX = scrollValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, containerWidth / numberOfTabs],
        });
        return (
            <View style={[styles.tabs, { backgroundColor }, style]}>
                {tabs.map((name, page) => {
                    const isTabActive = activeTab === page;
                    return this.renderTab(name, page, isTabActive, goToPage);
                })}
                <Animated.View
                    style={[
                        tabUnderlineStyle,
                        {
                            transform: [{ translateX }],
                        },
                        tabBarUnderlineStyle,
                    ]}
                />
            </View>
        );
    }
}

export default DefaultTabBar;
