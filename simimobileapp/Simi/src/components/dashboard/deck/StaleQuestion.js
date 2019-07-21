import React, {Component} from 'react';
import {  
    StyleSheet, 
    View, 
    Text,
  } from 'react-native';
import {observer,inject} from 'mobx-react';
import strings from "../../../assets/en/json/strings.json";

let STALE = strings.deck.stale;

@inject('rootStore')
@observer
export default class StaleQuestion extends Component<Props> {
    qdStore = this.props.rootStore.questionDeckStore

    render() {
        return (
            <View style={styles.container}>
                {this.qdStore.showStaleQWarning &&
                <Text style={styles.staleText}>{STALE}</Text>
                }
            </View>
    )}
}

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      top: -40
    },
    staleText: {
        color: 'red',
        width: '50%',
        textAlign: 'center',
        padding: 5,
    }
})