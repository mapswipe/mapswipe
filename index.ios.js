import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

var Main = require('./src/shared/Main');

var style = StyleSheet.create({
    container: {
        flex: 1
    }

});

class Mapswipe extends Component {
  render() {
    return (
          <Main style={style.container}/>
    );
  }
}



AppRegistry.registerComponent('Mapswipe', () => Mapswipe);
