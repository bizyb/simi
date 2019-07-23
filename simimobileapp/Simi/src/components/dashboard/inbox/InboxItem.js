import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import { Col, Grid } from "react-native-easy-grid";
import { getDate } from "../../../utils/utils";
import {observer,inject} from 'mobx-react';

let SUBHEADING_LENGTH = 95;
@inject('rootStore')
@observer
export default class InboxItem extends Component<Props> {
    iStore = this.props.rootStore.inboxStore

    subheading = () => {
        if (this.props.subheading.length > SUBHEADING_LENGTH) {
            return this.props.subheading.substring(0, SUBHEADING_LENGTH) + "..."
        }
        return this.props.subheading
    }
    renderItem = () => {  
        let _onPress = ()=> {this.props.onPress(this.props.messageType, this.props.index)}
        let _onLongPress = ()=> {this.props.onPress(this.props.messageType, this.props.index, longPress=true)}
        let highlight = "transparent"
        let border = {}
        if (this.iStore.data[this.props.index].isSelected) { highlight = "#eeeeee"}
        if (this.props.index > 0) {
            border.borderTopWidth = 1
            border.borderColor = 'red' 
        }
        return (
                <View style={[styles.rowContainer, {backgroundColor: highlight}, border]}>
                    <Image source={{uri: this.props.partnerPicture}} style={styles.profileImage}/>
                    <View style={styles.row}>
                    <Grid>
                        <Col style={styles.leftCol}>
                            <Text 
                                style={[styles.heading, this.iStore.data[this.props.index].isRead ? { color: 'grey'} : {color: 'black'}]} 
                                onPress={_onPress}
                                onLongPress={_onLongPress}>{this.props.heading}</Text>
                        </Col>
                        <Col style={styles.rightCol}>
                            <Text style={styles.date}
                            onLongPress={_onLongPress}>{getDate("inbox", this.props.date)}</Text> 
                        </Col>
                    </Grid>
                </View>
                    <Text style={styles.subheading}
                    onLongPress={_onLongPress} 
                    onPress={(_onPress)}>{this.subheading()}</Text>
                </View>
            
            );
    }
    render() { 
        return (
            <View>
            {this.renderItem()}
            </View>
            
        );
        }
    }
  const styles = StyleSheet.create({
    rowContainer: {
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 20,
      paddingRight: 20,
      marginBottom: 2,

    },
    row: {
        flexDirection: 'row',
        marginTop: -5,
      },
      leftCol: {
        width: '70%'
      },
      rightCol: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      },
      heading: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 20,
      },
      subheading: {
        fontSize: 16,
      },
      expiration: {
          color: "#e8491b"
      },
      profileImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
    },
  });