// @flow
import * as React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    COLOR_DARK_GRAY,
    COLOR_LIGHT_GRAY,
} from '../../constants';

const styles = StyleSheet.create({
    box: {
        backgroundColor: COLOR_DARK_GRAY,
        left: '15%',
        opacity: 0.8,
        padding: 5,
        position: 'absolute',
        width: '70%',
    },
    text: {
        color: COLOR_LIGHT_GRAY,
        fontSize: 13,
    },
});

type Props = {
    children: React.Node,
};

type State = {
    position: string;
};

export default class TutorialBox extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            position: '10%',
        };
    }

    moveBox = () => {
        let { position } = this.state;
        if (position === '10%') {
            position = '80%';
        } else {
            position = '10%';
        }
        this.setState({ position });
    }

    render() {
        const { children } = this.props;
        const { position } = this.state;
        return (
            <View style={[styles.box, { top: position }]}>
                <TouchableOpacity
                    onPress={this.moveBox}
                >
                    <Text style={styles.text}>
                        {children}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
