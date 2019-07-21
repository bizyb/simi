import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import IconLock from 'react-native-vector-icons/Ionicons';
import Dialog from "react-native-dialog";
import { getDate } from "../../utils/utils";
import strings from "../../assets/en/json/strings.json";
import {observer,inject} from 'mobx-react';
import { request } from "../../api/api";
import { DEBUG } from "../../../settings"

let OK = strings.global.ok;
let ENCRYPTION_DESC = strings.chat.encryptionDesc;

@inject('rootStore')
@observer
export default class ChatMessageList extends Component<Props> {
  cmlStore = this.props.rootStore.chatMessageListStore
  crStore = this.props.rootStore.chatRoomStore
  sessionStore = this.props.rootStore.sessionStore
 

    componentWillMount() {
      if (this.cmlStore.id != "") {
        if (!this.cmlStore.cache[this.cmlStore.id]) {
          let data = {
            userId: this.sessionStore.userId,
            questionId: this.cmlStore.id,
          }
          request(data, this.sessionStore.endpoints.chatLog, this.sessionStore.endpoints.methods.get).then((result) => {
            this.cmlStore.data = result
            this.cmlStore.cache[this.cmlStore.id] = result
          }).catch((err) => {
            DEBUG && console.log(err)
          })
        } else {
          this.cmlStore.data = this.cmlStore.cache[this.cmlStore.id]
        }
      }

      
    }
    toggleEncryptionDialog = () => {
      this.cmlStore.showEncryptionDialog = !this.cmlStore.showEncryptionDialog
    }
    renderEncryptionMsgDialog = () => {
      return (
        <View>
          <Dialog.Container visible={this.cmlStore.showEncryptionDialog}>
            <Dialog.Description>
              {ENCRYPTION_DESC}
            </Dialog.Description>
            <Dialog.Button 
                label={OK} 
                onPress={this.toggleEncryptionDialog}
                />
          </Dialog.Container>
        </View>
      )

    }
    renderItem = (item) => {
      if (item.item.question) { 
        return (
          <View>
            <View style={styles.lockDateContainer}>
                  <IconLock 
                      name="ios-lock" 
                      size={16} 
                      onPress={this.toggleEncryptionDialog}
                      color="tomato"/>
                  <Text style={styles.chatDate}>{
                    getDate("chat", item.item.created)}</Text>
            </View> 
            <Text style={styles.question}>{item.item.question}</Text>
          </View>
        )
      }
      else if (item.item.fromId == this.sessionStore.userId) {
        return (
          <View style={styles.outerViewRight}> 
            <View style={styles.innerViewRight}>
            <Text style={styles.item}>{item.item.message}</Text>
            </View>
          </View>
        ) 
      }
      else {
        return (
          <View style={styles.outerViewLeft}> 
            <View style={styles.innerViewLeft}>
            <Text style={styles.item}>{item.item.message}</Text>
            </View>
          </View>
        )
      }
     
      
    }
    renderFlatList = () => {
      if (this.props.isChatRoom) {
        return (
          <FlatList
              inverted={true}
              showsVerticalScrollIndicator={false}
              extraData={this.crStore.data}
              data={this.crStore.data}
              renderItem={this.renderItem}
              keyExtractor={item => item.key}
          />
        ) 
      }
      else {
        return (
          <FlatList
            inverted={true}
            showsVerticalScrollIndicator={false}
            extraData={this.cmlStore}
            data={this.cmlStore.data}
            renderItem={this.renderItem}
            keyExtractor={item => item.key}
        />
        )
      }
    }
    render() {
      return (
              <View style={[styles.messageList,{height: this.props.height}] }>
                {this.renderFlatList()}
                {this.renderEncryptionMsgDialog()}
            </View>
      );
    }
  }
 
  const styles = StyleSheet.create({
    messageList: {
        flex: 1,
        height: 400,
        paddingTop: 0,
        paddingLeft: 10,
        paddingRight: 5,
        paddingBottom: 10, 
    },
      item: {
        fontSize: 16,
        padding: 10,
        color: 'black',
      },
      innerViewRight: {
        backgroundColor: '#efefef',
        borderColor: '#efefef',
        borderWidth: 1,
        borderRadius: 20,
        padding: 2,
        margin: 5,
        maxWidth: '70%'
      },
      outerViewRight: {
        backgroundColor: 'white',
        alignItems: 'flex-end',
      },
      innerViewLeft: {
        backgroundColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        padding: 2,
        margin: 5,
        maxWidth: '70%'
      },
      outerViewLeft: {
        backgroundColor: 'white',
        alignItems: 'flex-start',
      },
      question: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 20,
        padding: 20,
        paddingBottom: '50%',
        color: 'black',
      },
      chatDate: {
        textAlign: 'center',
        fontSize: 14,
        paddingLeft: 10,
        color: 'grey',
      },
      lockDateContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 50,
        alignContent: 'center',
        justifyContent: 'center',
      },
      questionIntroMsg: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingTop: 80,
      },
      questionIntroMsgText: {
        color: 'grey',
        fontSize: 16,
      }
  });