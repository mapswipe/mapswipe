/* eslint-disable ft-flow/no-types-missing-file-annotation */
/* eslint-disable no-underscore-dangle,
  react/destructuring-assignment,
  no-param-reassign,
  react/sort-comp,
  react/no-access-state-in-setstate,
  class-methods-use-this */
import * as React from 'react';
import { Dimensions, View, Animated, Platform, StyleSheet } from 'react-native';

// const TimerMixin = require('react-timer-mixin');
import PagerView from 'react-native-pager-view';

import SceneComponent from './SceneComponent';
import DefaultTabBar from './DefaultTabBar';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollableContentAndroid: {
        flex: 1,
    },
});

const AnimatedViewPagerAndroid =
    Platform.OS === 'android'
        ? Animated.createAnimatedComponent(PagerView)
        : undefined;

type Props = {
    children: React.ReactNode,
    tabBarPosition: string,
    initialPage: number,
    page: number,
    onChangeTab: () => any,
    onScroll: () => any,
    renderTabBar: any,
    tabBarUnderlineStyle: any,
    tabBarBackgroundColor: string,
    tabBarActiveTextColor: string,
    tabBarInactiveTextColor: string,
    tabBarTextStyle: {},
    style: any,
    contentProps: {},
    scrollWithoutAnimation: boolean,
    locked: boolean,
    prerenderingSiblingsNumber: number,
};

type State = {
    containerWidth: number,
};

class ScrollableTabView extends React.Component<Props, State> {
    scrollOnMountCalled: false;

    tabWillChangeWithoutGesture: false;

    static defaultProps = {
        tabBarPosition: 'top',
        initialPage: 0,
        page: -1,
        onChangeTab: () => {},
        onScroll: () => {},
        contentProps: {},
        scrollWithoutAnimation: false,
        locked: false,
        prerenderingSiblingsNumber: 0,
    };

    constructor(props: Props) {
        super(props);
        const windowWidth = Dimensions.get('window').width;
        let scrollValue;
        let scrollXIOS;
        let positionAndroid;
        let offsetAndroid;

        if (Platform.OS === 'ios') {
            scrollXIOS = new Animated.Value(0);
            const containerWidthAnimatedValue = new Animated.Value(windowWidth);
            // Need to call __makeNative manually to avoid a native animated bug. See
            // https://github.com/facebook/react-native/pull/14435
            containerWidthAnimatedValue.__makeNative();
            scrollValue = Animated.divide(
                scrollXIOS,
                containerWidthAnimatedValue,
            );

            const callListeners = this._polyfillAnimatedValue(scrollValue);
            scrollXIOS.addListener(({ value }) =>
                // eslint-disable-next-line react/destructuring-assignment
                callListeners(value / this.state.containerWidth),
            );
        } else {
            positionAndroid = new Animated.Value(0);
            offsetAndroid = new Animated.Value(0);
            scrollValue = Animated.add(positionAndroid, offsetAndroid);

            const callListeners = this._polyfillAnimatedValue(scrollValue);
            let positionAndroidValue = 0;
            let offsetAndroidValue = 0;
            positionAndroid.addListener(({ value }) => {
                positionAndroidValue = value;
                callListeners(positionAndroidValue + offsetAndroidValue);
            });
            offsetAndroid.addListener(({ value }) => {
                offsetAndroidValue = value;
                callListeners(positionAndroidValue + offsetAndroidValue);
            });
        }

        this.state = {
            currentPage: 0,
            scrollValue,
            scrollXIOS,
            positionAndroid,
            offsetAndroid,
            containerWidth: windowWidth,
            sceneKeys: this.newSceneKeys({
                currentPage: 0,
            }),
        };
    }

    componentDidUpdate(prevProps: Props) {
        const { children, page } = this.props;
        const { currentPage } = this.state;
        if (children !== prevProps.children) {
            this.updateSceneKeys({
                page: currentPage,
                children,
            });
        }

        if (page >= 0 && page !== currentPage) {
            this.goToPage(page);
        }
    }

    componentWillUnmount() {
        const { offsetAndroid, positionAndroid, scrollXIOS } = this.state;
        if (Platform.OS === 'ios') {
            scrollXIOS.removeAllListeners();
        } else {
            positionAndroid.removeAllListeners();
            offsetAndroid.removeAllListeners();
        }
    }

    // Animated.add and Animated.divide do not currently support listeners so
    // we have to polyfill it here since a lot of code depends on being able
    // to add a listener to `scrollValue`. See https://github.com/facebook/react-native/pull/12620.
    // eslint-disable-next-line class-methods-use-this
    _polyfillAnimatedValue = animatedValue => {
        const listeners = new Set();
        const addListener = listener => {
            listeners.add(listener);
        };

        const removeListener = listener => {
            listeners.delete(listener);
        };

        const removeAllListeners = () => {
            listeners.clear();
        };

        animatedValue.addListener = addListener;
        animatedValue.removeListener = removeListener;
        animatedValue.removeAllListeners = removeAllListeners;

        return value => listeners.forEach(listener => listener({ value }));
    };

    _handleLayout = e => {
        const { width } = e.nativeEvent.layout;

        if (
            !width ||
            width <= 0 ||
            Math.round(width) === Math.round(this.state.containerWidth)
        ) {
            return;
        }

        if (Platform.OS === 'ios') {
            const containerWidthAnimatedValue = new Animated.Value(width);
            // Need to call __makeNative manually to avoid a native animated bug. See
            // https://github.com/facebook/react-native/pull/14435
            containerWidthAnimatedValue.__makeNative();
            const scrollValue = Animated.divide(
                this.state.scrollXIOS,
                containerWidthAnimatedValue,
            );
            this.setState({ containerWidth: width, scrollValue });
        } else {
            this.setState({ containerWidth: width });
        }
        this.requestAnimationFrame(() => {
            this.goToPage(this.state.currentPage);
        });
    };

    _keyExists(sceneKeys, key) {
        return sceneKeys.find(sceneKey => key === sceneKey);
    }

    _makeSceneKey(child, idx) {
        return `${child.props.tabLabel}_${idx}`;
    }

    _composeScenes() {
        return this._children().map((child, idx) => {
            const key = this._makeSceneKey(child, idx);
            return (
                <SceneComponent
                    key={child.key}
                    shouldUpdated={this._shouldRenderSceneKey(
                        idx,
                        this.state.currentPage,
                    )}
                    style={{ width: this.state.containerWidth }}
                >
                    {this._keyExists(this.state.sceneKeys, key) ? (
                        child
                    ) : (
                        <View tabLabel={child.props.tabLabel} />
                    )}
                </SceneComponent>
            );
        });
    }

    _onMomentumScrollBeginAndEnd = e => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / this.state.containerWidth);
        if (this.state.currentPage !== page) {
            this._updateSelectedPage(page);
        }
    };

    _updateSelectedPage = nextPage => {
        let localNextPage = nextPage;
        if (typeof localNextPage === 'object') {
            localNextPage = nextPage.nativeEvent.position;
        }

        const { currentPage } = this.state;
        if (!this.tabWillChangeWithoutGesture) {
            this.updateSceneKeys({
                page: localNextPage,
                callback: this._onChangeTab.bind(
                    this,
                    currentPage,
                    localNextPage,
                ),
            });
        }
        this.tabWillChangeWithoutGesture = false;
    };

    _onChangeTab = (prevPage, currentPage) => {
        this.props.onChangeTab({
            i: currentPage,
            ref: this._children()[currentPage],
            from: prevPage,
        });
    };

    _onScroll = e => {
        if (Platform.OS === 'ios') {
            const offsetX = e.nativeEvent.contentOffset.x;
            if (offsetX === 0 && !this.scrollOnMountCalled) {
                this.scrollOnMountCalled = true;
            } else {
                this.props.onScroll(offsetX / this.state.containerWidth);
            }
        } else {
            const { position, offset } = e.nativeEvent;
            this.props.onScroll(position + offset);
        }
    };

    _shouldRenderSceneKey(idx, currentPageKey) {
        const numOfSibling = this.props.prerenderingSiblingsNumber;
        return (
            idx < currentPageKey + numOfSibling + 1 &&
            idx > currentPageKey - numOfSibling - 1
        );
    }

    newSceneKeys = ({
        previousKeys = [],
        currentPage = 0,
        children = this.props.children,
    }) => {
        const newKeys = [];
        this._children(children).forEach((child, idx) => {
            const key = this._makeSceneKey(child, idx);
            if (
                this._keyExists(previousKeys, key) ||
                this._shouldRenderSceneKey(idx, currentPage)
            ) {
                newKeys.push(key);
            }
        });
        return newKeys;
    };

    updateSceneKeys({
        page,
        children = this.props.children,
        callback = () => {},
    }) {
        const newKeys = this.newSceneKeys({
            previousKeys: this.state.sceneKeys,
            currentPage: page,
            children,
        });
        this.setState({ currentPage: page, sceneKeys: newKeys }, callback);
    }

    goToPage = pageNumber => {
        if (Platform.OS === 'ios') {
            const offset = pageNumber * this.state.containerWidth;
            if (this.scrollView) {
                this.scrollView.scrollTo({
                    x: offset,
                    y: 0,
                    animated: !this.props.scrollWithoutAnimation,
                });
            }
        } else if (this.scrollView) {
            this.tabWillChangeWithoutGesture = true;
            if (this.props.scrollWithoutAnimation) {
                this.scrollView.setPageWithoutAnimation(pageNumber);
            } else {
                this.scrollView.setPage(pageNumber);
            }
        }

        const { currentPage } = this.state;
        this.updateSceneKeys({
            page: pageNumber,
            callback: this._onChangeTab.bind(this, currentPage, pageNumber),
        });
    };

    _children(children = this.props.children) {
        return React.Children.map(children, child => child);
    }

    renderScrollableContent = () => {
        if (Platform.OS === 'ios') {
            const scenes = this._composeScenes();
            return (
                <Animated.ScrollView
                    horizontal
                    pagingEnabled
                    automaticallyAdjustContentInsets={false}
                    contentOffset={{
                        x: this.props.initialPage * this.state.containerWidth,
                    }}
                    ref={scrollView => {
                        this.scrollView = scrollView;
                    }}
                    onScroll={Animated.event(
                        [
                            {
                                nativeEvent: {
                                    contentOffset: { x: this.state.scrollXIOS },
                                },
                            },
                        ],
                        { useNativeDriver: true, listener: this._onScroll },
                    )}
                    onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
                    onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
                    scrollEventThrottle={16}
                    scrollsToTop={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={!this.props.locked}
                    directionalLockEnabled
                    alwaysBounceVertical={false}
                    keyboardDismissMode="on-drag"
                    {...this.props.contentProps}
                >
                    {scenes}
                </Animated.ScrollView>
            );
        }
        const scenes = this._composeScenes();
        return (
            <AnimatedViewPagerAndroid
                key={this._children().length}
                style={styles.scrollableContentAndroid}
                initialPage={this.props.initialPage}
                onPageSelected={this._updateSelectedPage}
                keyboardDismissMode="on-drag"
                scrollEnabled={!this.props.locked}
                onPageScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                position: this.state.positionAndroid,
                                offset: this.state.offsetAndroid,
                            },
                        },
                    ],
                    {
                        useNativeDriver: true,
                        listener: this._onScroll,
                    },
                )}
                ref={scrollView => {
                    this.scrollView = scrollView;
                }}
                {...this.props.contentProps}
            >
                {scenes}
            </AnimatedViewPagerAndroid>
        );
    };

    renderTabBar(props) {
        if (this.props.renderTabBar === false) {
            return null;
        }
        if (this.props.renderTabBar) {
            return React.cloneElement(this.props.renderTabBar(props), props);
        }
        return <DefaultTabBar {...props} />;
    }

    render() {
        const overlayTabs =
            this.props.tabBarPosition === 'overlayTop' ||
            this.props.tabBarPosition === 'overlayBottom';
        const tabBarProps = {
            goToPage: this.goToPage,
            tabs: this._children().map(child => child.props.tabLabel),
            activeTab: this.state.currentPage,
            scrollValue: this.state.scrollValue,
            containerWidth: this.state.containerWidth,
        };

        if (this.props.tabBarBackgroundColor) {
            tabBarProps.backgroundColor = this.props.tabBarBackgroundColor;
        }
        if (this.props.tabBarActiveTextColor) {
            tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
        }
        if (this.props.tabBarInactiveTextColor) {
            tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
        }
        if (this.props.tabBarTextStyle) {
            tabBarProps.textStyle = this.props.tabBarTextStyle;
        }
        if (this.props.tabBarUnderlineStyle) {
            tabBarProps.underlineStyle = this.props.tabBarUnderlineStyle;
        }
        if (overlayTabs) {
            tabBarProps.style = {
                position: 'absolute',
                left: 0,
                right: 0,
                [this.props.tabBarPosition === 'overlayTop'
                    ? 'top'
                    : 'bottom']: 0,
            };
        }

        return (
            <View
                style={[styles.container, this.props.style]}
                onLayout={this._handleLayout}
            >
                {this.props.tabBarPosition === 'top' &&
                    this.renderTabBar(tabBarProps)}
                {this.renderScrollableContent()}
                {(this.props.tabBarPosition === 'bottom' || overlayTabs) &&
                    this.renderTabBar(tabBarProps)}
            </View>
        );
    }
}

export default ScrollableTabView;
