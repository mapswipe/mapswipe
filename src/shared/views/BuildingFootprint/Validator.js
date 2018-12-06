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
        height: 40,
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
    },
});

export default class Validator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTaskId: 0,
        };
    }

    nextTask = () => {
        const { currentTaskId } = this.state;
        this.setState({ currentTaskId: currentTaskId + 1 });
    }

    render = () => {
        const { group, project } = this.props;
        const { currentTaskId } = this.state;
        const fullTaskId = `${group.projectId}_${group.id}_${currentTaskId}`;
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
                    onPress={this.nextTask}
                    style={[
                        { backgroundColor: 'green' },
                        styles.button,
                    ]}
                >
                    Looks good
                </Button>
                <Button
                    onPress={this.nextTask}
                    style={[
                        { backgroundColor: 'orange' },
                        styles.button,
                    ]}
                >
                    Needs adjustment
                </Button>
                <Button
                    onPress={this.nextTask}
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
