const React = require('react');
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
const ReactNative = require('react-native');
const {
    StyleSheet,
    Text,
    View,
    Animated,
} = ReactNative;
const Button = require('./Button');

const MapswipeTabBar = createReactClass({
    propTypes: {
        goToPage: PropTypes.func,
        activeTab: PropTypes.number,
        tabs: PropTypes.array,
        underlineColor: PropTypes.string,
        underlineHeight: PropTypes.number,
        backgroundColor: PropTypes.string,
        activeTextColor: PropTypes.string,
        inactiveTextColor: PropTypes.string,
      //textStyle: PropTypes.style,
      //tabStyle: PropTypes.style,
    },

    getDefaultProps() {
        return {
            activeTextColor: 'navy',
            inactiveTextColor: 'black',
            underlineColor: 'navy',
            backgroundColor: null,
            underlineHeight: 4,
        };
    },

    renderTabOption(name, page) {
        const isTabActive = this.props.activeTab === page;
        const {activeTextColor, inactiveTextColor, textStyle,} = this.props;
        const textColor = isTabActive ? activeTextColor : inactiveTextColor;
        const fontWeight = isTabActive ? 'bold' : 'normal';

        return <Button
            style={{flex: 1}}
            key={name}
            accessible={true}
            accessibilityLabel={name}
            accessibilityTraits='button'
            onPress={() => this.props.goToPage(page)}
        >
            <View style={[styles.tab, this.props.tabStyle]}>
                <Text style={[{color: textColor, fontWeight,}, textStyle,]}>
                    {name}
                </Text>
            </View>
        </Button>;
    },

    render() {
        const containerWidth = this.props.containerWidth;
        const numberOfTabs = this.props.tabs.length;
        const tabUnderlineStyle = {
            position: 'absolute',
            width: containerWidth / numberOfTabs,
            height: this.props.underlineHeight,
            backgroundColor: this.props.underlineColor,
            bottom: 0,
        };

        const left = this.props.scrollValue.interpolate({
            inputRange: [0, 1,], outputRange: [0, containerWidth / numberOfTabs,],
        });

        return (
            <View style={[styles.tabs, {backgroundColor: this.props.backgroundColor,}, this.props.style,]}>
                {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
                {/* FIXME: readd "left" style here */}
                <Animated.View style={[tabUnderlineStyle,]}/>
            </View>
        );
    },
});

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
        borderBottomColor: '#0d1949',
    },
});

module.exports = MapswipeTabBar;
