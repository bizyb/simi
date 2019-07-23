import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import { Col, Grid } from "react-native-easy-grid";
import { getDate } from "../../../utils/utils";
import {observer,inject} from 'mobx-react';

let SUBHEADING_LENGTH = 64;
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
            border.borderColor = '#eeeeee' 
        }
        return (
                <View style={[styles.rowContainer, {backgroundColor: highlight}]}>
                    <Image source={{uri: this.props.partnerPicture}} style={styles.profileImage}/>
                    <View style={[styles.rowText, border]}>
                    <Grid>
                        <Col style={styles.leftCol}>
                            <Text 
                                style={[styles.heading, this.iStore.data[this.props.index].isRead ? { color: 'grey'} : {color: 'black'}]} 
                                onPress={_onPress}
                                onLongPress={_onLongPress}>{this.props.heading}</Text>
                        </Col>
                        <Col style={styles.rightCol}>
                            <Text style={styles.date}
                            onPress={_onPress}
                            onLongPress={_onLongPress}>{getDate("inbox", this.props.date)}</Text> 
                        </Col>
                    </Grid>
                
                    <Text style={styles.subheading}
                    onLongPress={_onLongPress} 
                    onPress={(_onPress)}>{this.subheading()}</Text>
                    </View>
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
      paddingLeft: 20,
      paddingRight: 20,
    //   marginBottom: 2,
      flexDirection: 'row',


    },
    rowText: {
        // flexDirection: 'row',
        // marginTop: -5,
        paddingTop: 5,
        paddingBottom: 15,
        width: "85%",
        // backgroundColor: 'green',
        // paddingLeft: 20,
      },
      leftCol: {
        width: '70%'
      },
      rightCol: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      },
      heading: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 10,
      },
      subheading: {
        fontSize: 16,
      },
      expiration: {
          color: "#e8491b"
      },
      profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginTop: 12,
        marginRight: 15,
        // width: "20%",
    },
  });