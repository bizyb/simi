import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';

export default class CardStack extends Component<Props> {
    
    render() {
        return (
            <View style={styles.container}>
            
                <View style={styles.card}>
                    <Text style={styles.question}>{this.props.item.question}</Text>
                </View>
            </View>
        );
      }
    }

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 50,
          marginTop: -20,
        },
        question: {
            textAlign: 'left',
            fontSize: 26,
            fontWeight: 'bold',
            color: 'white',
            padding: 30,
        },
        row: {
            flexDirection: 'row',
            height: '20%',
            padding: 40,
          },
        card: { 
            flex: 1,
          backgroundColor: '#e8491b',
          width: '90%',
          borderWidth: 1,
          borderColor: '#e8491b',
          borderRadius: 40,
          },
      });