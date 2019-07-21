import React, {Component} from 'react';
import {StyleSheet, View, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import strings from "../../../assets/en/json/strings.json";

let PLACEHOLDER = strings.knowledgeBase.placeholder;
export default class TopicInput extends Component<Props> {

   
  _renderTextInput = () => {
    if (this.props.showBox) {
      return (
        <View style={styles.container}>
          <TextInput style={styles.inputBox} 
                    onChangeText={(text) => this.props._onChangeText(text)}
                    value={this.props._value}
                    onSubmitEditing={this.props.onSubmit}
                    placeholder={PLACEHOLDER}/>
          <Icon name="close" size={20} style={styles.close} onPress={this.props._onClose}/>
        </View>
      );
    }
  }
  
  render() { 
      return (
          <View>{this._renderTextInput()}</View>
      );
    }
  }
  const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        // backgroundColor: 'red',
      },
      inputBox: {
        borderWidth: 1,
        borderRadius: 50,
        borderColor: "#aaaaaa",
        height: 50,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        right:0,
        paddingLeft: 40,
        paddingRight: 60,
        fontSize: 16,
        backgroundColor: "white",
      },
      close: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 35,
        left: 10,
      }, 
  });