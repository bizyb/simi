import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import strings from "../../assets/en/json/strings.json";

let SLOGAN_WELCOME = strings.login.sloganWelcome;
let SLOGAN_MAIN = strings.login.sloganMain
export default class Slogan extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.mainText}>{SLOGAN_WELCOME}</Text>
        <Text style={styles.minorText}>{SLOGAN_MAIN}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  mainText: {
    color: 'black',
    fontSize: 28
  },
  minorText: {
    color: 'grey',
    paddingTop: 10,
  }

});
