import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconQuestion from 'react-native-vector-icons/MaterialCommunityIcons';


export default class CircularButton extends Component {

  _renderIcon = () => {
    let icon = this.props.icon
    let size = 28
    let Comp = Icon
    if (icon == "ask") {
      icon = "comment-question"
      Comp = IconQuestion
    } 

    return (
      <Comp name={icon} size={size} style={styles.icon}/>
    )
  }
  render() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress = {()=>this.props._onPress(this.props.icon)} // only applies to index screen
        activeOpacity={0.5}>
        {this._renderIcon()}
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e8491b',
    borderColor: '#e8491b',
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right:20,
  },
  icon: {
    color: 'white',
  },
  });