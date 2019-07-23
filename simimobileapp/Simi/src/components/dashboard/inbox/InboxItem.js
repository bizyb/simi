import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Dimensions, PixelRatio} from 'react-native';
import { Col, Grid } from "react-native-easy-grid";
import { getDate } from "../../../utils/utils";
import {observer,inject} from 'mobx-react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DEBUG } from '../../../../settings';

const SCREEN_WIDTH = Math.round(Dimensions.get('window').width)
const HEADER_LENGTH = 20;
@inject('rootStore')
@observer
export default class InboxItem extends Component<Props> {
    iStore = this.props.rootStore.inboxStore
    subheadingLength = 32 //default

    componentDidMount() {
        this.computeSubheadingLength()
    }

    computeSubheadingLength = () => {
        let padding = 40 // in dp
        let rowFraction = 0.85
        let fontSize = 14 // in dp
        let charWidth = fontSize / PixelRatio.get() // in dp
        let imageWidth = 50 // in dp
        let elipsisSize = 3 * fontSize // in dp
        let rowWidth =  (SCREEN_WIDTH - padding - imageWidth) * rowFraction // in dp
        let textWidth  = rowWidth - elipsisSize
        this.subheadingLength = Math.round(textWidth/charWidth)

    }
    truncateString = (text, maxLength, isSubheading=false) => {
        if (text.length > maxLength) {
            text = text.substring(0, maxLength)
            if (isSubheading) { text += "..."}
        }
        return text
    } 
    // heading = () => {
    //     if (this.props.heading.length > HEADER_LENGTH) {
    //         return this.props.heading.substring(0, HEADER_LENGTH)
    //     }
    //     return this.props.heading
    // }
    // subheading = () => {
    //     if (this.props.subheading.length > this.subheadingLength) {
    //         return this.props.subheading.substring(0, this.subheadingLength) + "..."
    //     }
    //     return this.props.subheading
    // }
    renderItem = () => {  
        let _onPress = ()=> {this.props.onPress(this.props.messageType, this.props.index)}
        let _onLongPress = ()=> {this.props.onPress(this.props.messageType, this.props.index, longPress=true)}
        let highlight = "transparent"
        let border = {}
        if (this.iStore.data[this.props.index].isSelected) { highlight = "#eeeeee"}
        if (this.props.index > 0) {
            border.borderTopWidth = 1
            border.borderColor = '#f5f5f5' 
        }
        return (
                <View style={[styles.rowContainer, {backgroundColor: highlight}]}>
                    <TouchableOpacity
                        onPress={_onPress}
                        onLongPress={_onLongPress}>
                    <Image source={{uri: this.props.partnerPicture}} style={styles.profileImage}/>
                    </TouchableOpacity>
                    <View style={[styles.rowText, border]}>
                    <Grid>
                        <Col style={styles.leftCol}>
                            <Text 
                                style={[styles.heading, this.iStore.data[this.props.index].isRead ? { color: 'grey'} : {color: 'black'}]} 
                                onPress={_onPress}
                                onLongPress={_onLongPress}>{this.truncateString(this.props.heading, HEADER_LENGTH)}</Text>
                        </Col>
                        <Col style={styles.rightCol}>
                            <Text style={styles.date}
                            onPress={_onPress}
                            onLongPress={_onLongPress}>{getDate("inbox", this.props.date)}</Text> 
                        </Col>
                    </Grid>
                
                    <Text style={styles.subheading}
                    onLongPress={_onLongPress} 
                    onPress={(_onPress)}>{this.truncateString(this.props.subheading, this.subheadingLength, isSubheading=true)}</Text>
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
      flexDirection: 'row',
    },
    rowText: {
        paddingTop: 5,
        paddingBottom: 15,
        width: '85%',
      },
      leftCol: {
        width: '60%',
      },
      rightCol: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      },
      date: {
          fontSize: 12,
      },
      heading: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingTop: 10,
      },
      subheading: {
        fontSize: 14,
      },
      profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginTop: 12,
        marginRight: 15,
    },
  });