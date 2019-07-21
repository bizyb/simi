import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  View

} from 'react-native';
import ZocialIcons from 'react-native-vector-icons/Zocial';

export default class OvalButton extends Component {
  render() {
    let btnColor = this.props.provider == "google" ? styles.gBgColor : styles.fBgColor
    let textColor = this.props.provider == "google" ? styles.gTextColor : styles.fTextColor
    return (
      <View style={this.props.container}>
    <Animated.View>
      <TouchableOpacity
        style={[styles.button, btnColor]}
        onPress = {this.props.onPress}
        activeOpacity={0.85}>
        <ZocialIcons name={this.props.provider} size={20} color={textColor.color}/>
        <Text 
          style={[styles.text, textColor]}
            >{this.props.text}</Text>
      </TouchableOpacity>
    </Animated.View>
    </View>
    );
  }
}


const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: '#e8491b',
      borderWidth: 1,
      // border
      borderRadius: 30,
      zIndex: 100,
      width: 300,
      height: 50,
      flexDirection: 'row',
    },
    fBgColor: {
      backgroundColor: '#e8491b',
    },
    fTextColor: {
      color: 'white',
    },
    gBgColor: {
      backgroundColor: 'white',
    },
    gTextColor: {
      color: '#e8491b',
    },
    text: {
      backgroundColor: 'transparent',
      fontSize: 18,
      fontWeight: 'bold',
      padding: 20
    },
    image: {
      width: 24,
      height: 24,
    },
  });