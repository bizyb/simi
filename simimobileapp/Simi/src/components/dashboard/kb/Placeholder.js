import React, {Component} from 'react';
import {StyleSheet, View, Text, Image } from 'react-native';
import strings from "../../../assets/en/json/strings.json";

const library = "../../../assets/img/library.png";
let PLACEHOLDER = strings.placeholder.text;

export default class PlaceHolder extends Component<Props> {
  render() { 
      return (
          <View style={styles.container}>
            <Image source={require(library)} style={styles.image} />
            <Text style={styles.text}>{PLACEHOLDER}</Text>
          </View>
        
      );
    }
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: 100,
      // zIndex: 1000,
    },
      image: {
        height: 180,
        width: 180,
        justifyContent: 'center',
      alignContent: 'center',
      },
      text: {
        padding: 20,
        fontSize: 14,
        paddingTop: 20,
        textAlign: 'center',
      }
  });