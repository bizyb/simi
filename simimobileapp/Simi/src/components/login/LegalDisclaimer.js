import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import strings from "../../assets/en/json/strings.json";

let TOS_TEXT = strings.login.tos;
let PRIVACY_TEXT = strings.login.privacy;
let AND_TEXT = strings.global.and;
let MAIN_TEXT = strings.login.disclaimer;

export default class LegalDisclaimer extends Component {
 
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textMajor}>
          <Text>{MAIN_TEXT} </Text>
          <Text style={styles.textMinor} onPress={this.props.loadToS}>{TOS_TEXT}</Text> 
          <Text> {AND_TEXT} </Text>
          <Text style={styles.textMinor} onPress={this.props.loadPrivacy}>{PRIVACY_TEXT}</Text>
          <Text>.</Text>
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    bottom: 0,
    position: 'absolute',
  },
  textMajor: {
    color: 'grey',
    fontSize: 12,
    textAlign: 'center',
    padding: 30,
  },
  textMinor: {
    fontWeight: 'bold',
  },
});
