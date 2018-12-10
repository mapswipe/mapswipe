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
        this.state = {
            currentTaskId: 0,
        };
    }

    getFullTaskId = (group, taskNumber) => `${group.projectId}_${group.id}_${taskNumber}`;

    nextTask = (result) => {
        const { commitCompletedGroup, group, submitFootprintResult } = this.props;
        const { currentTaskId } = this.state;
        submitFootprintResult(result, this.getFullTaskId(group, currentTaskId));
        console.log('BLEH', currentTaskId, group.tasks, group.tasks.length);
        if (currentTaskId >= Object.keys(group.tasks).length - 1) {
            // no more tasks in the group, commit results and go back to menu
            commitCompletedGroup();
        }
        this.setState({ currentTaskId: currentTaskId + 1 });
    }

    render = () => {
        const { group, project } = this.props;
        const { currentTaskId } = this.state;
        const fullTaskId = this.getFullTaskId(group, currentTaskId);
        const currentTask = group.tasks[fullTaskId];
        console.log('VV', this.props, this.state);
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
