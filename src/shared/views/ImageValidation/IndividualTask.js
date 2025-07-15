// @flow
import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';

import ImageWrapper from './ImageWrapper';
import type { ImageValidationTaskType } from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    tasks: {
        flex: 1,
        width: GLOBAL.SCREEN_WIDTH,
    },
});

const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
};

type RefType = FlatList<ImageValidationTaskType> | null;

interface Props {
    tasks: ImageValidationTaskType[];
    onCurrentTaskIndexChange: (newIndex: number) => void;
    currentTaskIndex: number;
    totalSwipedTasks: number;
}

export default function Tasks(props: Props): React.Node {
    const {
        tasks,
        currentTaskIndex,
        totalSwipedTasks,
        onCurrentTaskIndexChange,
    } = props;

    const flatListRef = React.useRef<RefType>(null);

    const limitedTasks = [...(tasks ?? [])].slice(0, totalSwipedTasks + 1);

    // FIXME: Not sure if this is correct or even needed?
    // Scroll to selectedIndex when it changes from outside
    React.useEffect(() => {
        if (totalSwipedTasks + 1 > currentTaskIndex) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: currentTaskIndex,
                    animated: true,
                });
            }, 50);
        }
    }, [currentTaskIndex, totalSwipedTasks]);

    const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const { index } = viewableItems[0];
            if (index !== undefined && index !== null) {
                onCurrentTaskIndexChange(index);
            }
        }
    }).current;

    return (
        <FlatList
            style={styles.tasks}
            ref={flatListRef}
            data={limitedTasks}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => <ImageWrapper item={item} />}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            horizontal
            getItemLayout={(_, index) => ({
                length: GLOBAL.SCREEN_WIDTH,
                offset: GLOBAL.SCREEN_WIDTH * index,
                index,
            })}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
        />
    );
}
