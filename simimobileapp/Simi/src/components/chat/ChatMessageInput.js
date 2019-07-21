import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput} from 'react-native';
import {observer,inject} from 'mobx-react';

@inject('rootStore')
@observer
export default class ChatMessageInput extends Component<Props> {
    crStore = this.props.rootStore.chatRoomStore

    render() {
      return (
          <View style={styles.container}>
            <View style={styles.messageBox}>
                <View style={styles.leftCol}>
                    <TextInput 
                            style={styles.inputBox}
                            onChangeText={text=>this.props.onChangeText(text)} 
                            placeholder={this.crStore.placeholder} 
                            multiline={true}
                            editable={this.crStore.editable}
                            value={this.crStore.message}/>
                </View>
                <View style={styles.rightCol}>
                    <Text 
                        style={[styles.send, {color: this.crStore.buttonTextColor}]}
                        onPress={this.crStore.onSubmit}>{this.crStore.buttonText}</Text>
                </View>
            </View>
            </View>
      );
    }
  }

  const styles = StyleSheet.create({
      container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 5,
    },
    messageBox: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 40,
        width: '90%',
        marginBottom: 14,
    },
    leftCol: {
        width: '80%',
        paddingLeft: 15,
    },
    rightCol: {
        width: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 5,
      },
      inputBox: {
          fontSize: 16,
          maxHeight: 100
      },
      send: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#e8491b',
      }
  });
  