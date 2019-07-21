import React, {Component} from 'react';
import {StyleSheet, View, Image} from 'react-native';

const logoPath = "../../assets/img/simi.png";

export default class Logo extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image source={require(logoPath)} style={styles.image} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 30,
  },
  image: {
    width: 100,
    height: 100,
  },
});
