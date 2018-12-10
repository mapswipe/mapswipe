import * as React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import Button from 'apsl-react-native-button';
import FootprintDisplay from './FootprintDisplay';
import LoadingIcon from '../LoadingIcon';

const styles = StyleSheet.create({
    button: {
        borderRadius: 0,
        height: 55,
        marginBottom: 0,
        marginTop: 5,
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
    },
});

const FOOTPRINT_CORRECT = 1;
const FOOTPRINT_NEEDS_ADJUSTMENT = 2;
const FOOTPRINT_NO_BUILDING = 3;

export default class Validator extends React.Component {
    constructor(props) {
        super(props);
        this.taskGen = this.makeNextTaskGenerator(props.group.tasks);
        this.state = {
            currentTaskId: this.taskGen.next(),
        };
    }

    nextTask = (result) => {
        const { commitCompletedGroup, group, submitFootprintResult } = this.props;
        let { currentTaskId } = this.state;
        submitFootprintResult(result, currentTaskId.value);
        currentTaskId = this.taskGen.next();
        if (currentTaskId.done) {
            // no more tasks in the group, commit results and go back to menu
            commitCompletedGroup();
        }
        this.setState({ currentTaskId });
    }

    * makeNextTaskGenerator(tasks) {
        // generator function that picks the next task to work on
        // we cannot assume any specific order of taskId in the group
        const taskIds = Object.keys(tasks);
        let i;
        // eslint-disable-next-line no-plusplus
        for (i = 0; i < taskIds.length; i++) {
            yield taskIds[i];
        }
    }

    render = () => {
        const { group, project } = this.props;
        const { currentTaskId } = this.state;
        const currentTask = group.tasks[currentTaskId.value];
        if (currentTask === undefined) {
            return <LoadingIcon />;
        }
        return (
            <View>
                <FootprintDisplay
                    project={project}
                    task={currentTask}
                />
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_CORRECT)}
                    style={[
                        { backgroundColor: 'green' },
                        styles.button,
                    ]}
                >
                    Looks good
                </Button>
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_NEEDS_ADJUSTMENT)}
                    style={[
                        { backgroundColor: 'orange' },
                        styles.button,
                    ]}
                >
                    Needs adjustment
                </Button>
                <Button
                    onPress={() => this.nextTask(FOOTPRINT_NO_BUILDING)}
                    style={[
                        { backgroundColor: 'red' },
                        styles.button,
                    ]}
                >
                    No building
                </Button>
            </View>
        );
    }
}
