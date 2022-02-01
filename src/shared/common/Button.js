import React, {Component} from 'react';
import { Text, View, StyleSheet, Pressable, TouchableNativeFeedback} from 'react-native';

class OWN_BUTTON extends Component{
  _renderChildren() {
    let childElements = [];
    React.Children.forEach(this.props.children, (item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        const element = (
          <Text
            style={[styles.text, this.props.textStyle]}
            key={item}>
            {item}
          </Text>
        );
        childElements.push(element);
      } else if (React.isValidElement(item)) {
        childElements.push(item);
      }
    });
    return (childElements);
  }
  render() {
    if (this.props.isDisabled === true) {
      return (
        <View style={[styles.button, this.props.style, styles.opacity]}>
          {this._renderChildren()}
        </View>
      );
    }
    let extra_attributes = {testID: this.props.testID};

    return (
      <Pressable 
        style={[styles.button, this.props.style]} 
        onPress={this.props.onPress} 
        android_ripple={{color:'light-gray'}}
        {...extra_attributes}
      >
        {this._renderChildren()}
      </Pressable>
    )
  };
}

const styles = StyleSheet.create({
  button: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 10,
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  opacity: {
    opacity: 0.5,
  },
});
module.exports = OWN_BUTTON