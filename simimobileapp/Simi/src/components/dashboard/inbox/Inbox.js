import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import globalStyles from "../../../assets/js/Styles";
import InboxItem from './InboxItem';
import strings from "../../../assets/en/json/strings.json";
import {observer,inject} from 'mobx-react';
import { request, userIsOnline } from "../../../api/api";
import { DEBUG } from "../../../../settings";
import LogoutButton from './LogoutButton';
import CircularButton from '../../buttons/CircularButton';


let HEADER = strings.global.inbox;
let EMPTY = strings.inbox.empty;
let _trashBtn = "md-trash";

@inject('rootStore')
@observer
export default class Inbox extends Component<Props> {
  iStore = this.props.rootStore.inboxStore
  cmlStore = this.props.rootStore.chatMessageListStore
  sessionStore = this.props.rootStore.sessionStore
 
  static navigationOptions = {
    header: null,
  }
  focusListener = this.props.navigation.addListener("didFocus", () => {
    // The screen is focused
    userIsOnline(this.sessionStore.userId, 
      this.sessionStore.endpoints.user, 
      this.sessionStore.endpoints.methods.post,
      isOnline=true)
  })

  componentDidMount() {
    this.cmlStore.chatId = ""
    this.downloadInboxMessages()
  }

  /**
   * Download inbox messages upon component mount instead of navigation 
   * focus; If there are a lot of messages and we query the server every
   * time Inbox comes into focus, it's gonna slow down the app and strain
   * the server.
   */
  downloadInboxMessages = () => {
    let data = {
      userId: this.sessionStore.userId
    }
    request(data, this.sessionStore.endpoints.inbox, this.sessionStore.endpoints.methods.get).then((result) => {
      DEBUG && console.log("Inbox messages retrieved: ", result.data.length)
      this.iStore.data = result.data
    }).catch((err) => {
        DEBUG && console.log(err)
    })
    
  }

  /**
   * Toggle inbox item selection on long press by adding or 
   * removing it from the selectedItems list.
   */
  selectionHandler = (index) => {

    this.iStore.longPressEnabled = true
    this.iStore.showDeleteBtn = true

    if (this.iStore.selectedItems.includes(index)) {
      let selectedItemsUpdate = []
      for (var i = 0; i < this.iStore.selectedItems.length; i++) {
        let item = this.iStore.selectedItems[i]
        if (item != index) {
          selectedItemsUpdate.push(item)
        }
      }
      this.iStore.selectedItems = selectedItemsUpdate
      this.iStore.data[index].isSelected = false
    } else {
      this.iStore.selectedItems.push(index)
      this.iStore.data[index].isSelected = true
    }
    // make a copy of the data so the list could be re-rendered 
    // without delay 
    let newData = this.iStore.data.slice(0)
    this.iStore.data = newData

    if (this.iStore.selectedItems.length == 0) {
      this.iStore.longPressEnabled = false
      this.iStore.showDeleteBtn = false
    }
  }

  /**
   * todo: delete confirmation dialog is not shown. Implement this
   * in the future
   */
  showDeleteDialog = () => {
    this.iStore.showDeleteDialog = true 
  }

  /**
   * Delete the selected items from local store and the server.
   */
  onDelete = () => {
    let toDelete = []
    let newData = []
    if (this.iStore.selectedItems.length > 0) {
      for (var i=0; i < this.iStore.data.length; i++) {
        if (this.iStore.data[i].isSelected) {
          toDelete.push(this.iStore.data[i]._id)
        }
        else {
          newData.push(this.iStore.data[i])
        }
      }
      // reset states for re-rendering
      this.iStore.selectedItems = []
      this.iStore.showDeleteBtn = false
      this.iStore.longPressEnabled = false
      this.iStore.data = newData

      // delete from the server
      let data = {
        userId: this.sessionStore.userId,
        toDelete: toDelete,
      }
      request(data, this.sessionStore.endpoints.inbox, this.sessionStore.endpoints.methods.delete).then((result) => {
        DEBUG && console.log(result)
      }).catch((err) => {
        DEBUG && console.log(err)
      })

    }
  }

  _onPress = (messageType, index, longPress=false) => {
      // todo: cancel any pending/scheduled async events before navigating away
      
      if (longPress || this.iStore.longPressEnabled) { 
        this.selectionHandler(index)
      } 
      else {
        if (!this.iStore.longPressEnabled) {
          if (!this.iStore.data[index].isRead) {
            this.iStore.data[index].isRead = true
            let data = {
              userId: this.iStore.data[index].userId,
              _id: this.iStore.data[index]._id,
              isRead: true
            }
            request(data, this.sessionStore.endpoints.inbox, this.sessionStore.endpoints.methods.post).then((result) => {
              DEBUG && console.log(result)
            }).catch((err) => {
              DEBUG && console.log(err)
            })
        }
        if (messageType == "chat") {
          this.cmlStore.id = this.iStore.data[index].questionId
          this.props.navigation.navigate("ChatLog")
        }
        else if (messageType == "info") {
          this.props.navigation.navigate("InboxWebView", 
          {"url": this.iStore.data[index].url})
        }
      }
    } 
    }
    _renderInbox = ({item, index, _separators}) => {
      return (
        <InboxItem 
            index={index}
            partnerPicture={item.partnerPicture}
            heading={item.heading} 
            isOpened={item.isRead}
            subheading={item.subheading} 
            date={item.created}
            messageType={item.messageType}
            onPress={this._onPress}/>
      )
    }
    _renderSubheading = () => {
      if (this.iStore.data.length == 0) {
        return ( 
          <Text style={[globalStyles.tabSubheader, {
            paddingLeft: 20,
          }]}>{EMPTY}</Text>
        );
      }
      return null
    }
    render() {
      // DEBUG && console.log("this.iStore.selectedItems: ", this.iStore.selectedItems)
      // DEBUG && console.log("this.iStore.showDeleteBtn: ", this.iStore.showDeleteBtn)

      // // globalStyles.container,

      return (
        <View style={[{paddingBottom: 5, flex: 1}]}>
           <Text style={[
             globalStyles.tabHeader, {
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
              }
             ]}>{HEADER}</Text>
           <LogoutButton onPress={() => this.props.navigation.navigate("Auth")}/>
           {this._renderSubheading()}
           <FlatList
                  keyExtractor={item => item._id}
                  showsVerticalScrollIndicator={false}
                  extraData={this.iStore}
                  data={this.iStore.data}
                  renderItem={this._renderInbox}/>
            {this.iStore.showDeleteBtn && 
            <CircularButton icon={_trashBtn} _onPress={this.onDelete}/>}
        </View>
      );
    }
  }

