import React, {Component} from 'react';
import {StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {observer,inject} from 'mobx-react';

@inject('rootStore')
@observer
export default class Checkbox extends Component<Props> {

  kbStore = this.props.rootStore.knowledgeBaseStore

  _renderCheckbox = () => {
    let icon = "checkbox-blank-outline"
    let deleteStyle = styles.delete
    if (this.kbStore.tickedBoxes[this.props.index]) {
      icon = "checkbox-marked-outline"
      deleteStyle = styles.deleteChecked
    }
    return ( 
            <Icon 
                name={icon} 
                size={26} 
                style={deleteStyle} 
                onPress={this.props.callback}/>)
  }
  render() { 
      return (
          <View>{this._renderCheckbox()}</View>
        
      );
    }
  }
  const styles = StyleSheet.create({
      delete: {
       color: 'grey',
      },
      deleteChecked: {
        color: '#e8491b'
      }, 
  });