// @flow
import * as React from 'react';
import {
    Image,
    StyleSheet,
    FlatList,
    View,
} from 'react-native';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: GLOBAL.SCREEN_WIDTH,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
};

interface Props {
    tasks: ImageValidationTaskType[];
    onCurrentTaskIndexChange: (newIndex) => void;
    currentTaskIndex: number;
}

export default function SwipeableTasks(props: Props) {
    const {
        tasks,
        currentTaskIndex,
        onCurrentTaskIndexChange,
    } = props;

    const flatListRef = React.useRef<FlatList>(null);
    const currentIndexRef = React.useRef(currentTaskIndex);

    // Scroll to selectedIndex when it changes from outside
    React.useEffect(() => {
        if (currentIndexRef.current !== currentTaskIndex) {
            flatListRef.current?.scrollToIndex({
                index: currentTaskIndex,
                animated: true,
            });
            currentIndexRef.current = currentTaskIndex;
        }
    }, [currentTaskIndex]);

    const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const index = viewableItems[0].index;
            if (index !== currentIndexRef.current) {
                currentIndexRef.current = index;
                onCurrentTaskIndexChange(index);
            }
        }
    }).current;

    const renderItem = ({ item }: { item: ImageValidationTaskType }) => (
        <View style={styles.container}>
            <Image
                source={{ uri: item.url }}
                style={styles.image}
                fadeDuration={0}
            />
        </View>
    );

    return (
        <FlatList
            ref={flatListRef}
            data={tasks}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
        />
    );
}
