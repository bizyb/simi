import React, {Component} from 'react';
import {  
  StyleSheet, 
  View, 
  Text, 
  BackHandler,
  ActivityIndicator,
  AppState
} from 'react-native';
import ChatTopBar from './ChatTopBar';
import ChatMessageList from './ChatMessageList';
import ChatMessageInput from './ChatMessageInput';
import strings from "../../assets/en/json/strings.json";
import { request } from "../../api/api";
import {observer, inject} from 'mobx-react';
import { DEBUG } from "../../../settings";
import shortid from "shortid";

let PLACEHOLDER = strings.chat.placeholder;
let PROGRESS_TEXT_OP_Major = strings.chat.progressTextOPMajor;
let PROGRESS_TEXT_OP_Minor = strings.chat.progressTextOPMinor;
let PROGRESS_TEXT_SME = strings.chat.progressTextSME;
let SEND = strings.chat.send;
let CANCEL = strings.global.cancel;
let TOMATO = "tomato"
let GREY  = "grey"

@inject('rootStore')
@observer
export default class ChatRoom extends Component<Props> {
  crStore = this.props.rootStore.chatRoomStore
  qStore = this.props.rootStore.questionStore
  sessionStore = this.props.rootStore.sessionStore
  
  // focusListener = this.props.navigation.addListener("didFocus", () => {
  //   // The screen is focused
  //   this.redirectHome()
  // })
  
  static navigationOptions = {
    header: null,
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)

    // Listen for any sme/op connection events from the server
    let eventName
    if (this.sessionStore.isOp) {
      eventName = this.sessionStore.events.smeFound
    } else {
      eventName = this.sessionStore.events.opFound
    }
    this.sessionStore.socket.on(eventName, (data) => {
      this.sessionStore.chatPartner = data
      this.onConnection()
    })

  // Listen for new messages
  // Update the data array on new message. Although we can update the data array
  // directly and mob-x will react to the new data, it won't be shown to the user
  // until the user activates the input box. Real-time only possible if the entire
  // data structure is updated by cloning.
    this.sessionStore.socket.on(this.sessionStore.events.message, (data) => { 
      this.addChatMessage(data)
    })
   
    // listen for typing events
    this.sessionStore.socket.on(this.sessionStore.events.isTyping, (data) => {
      this.crStore.isTyping = data.isTyping
    })

    // listen for any alerts
    this.sessionStore.socket.on(this.sessionStore.events.alert, (alert) => {
      this.alertHandler(alert)
    })

    this.crStore.placeholder = PLACEHOLDER
    this.onNewConnection() 
    BackHandler.addEventListener('hardwareBackPress', ()=>{return true});  
}
componentWillUnmount() {
  BackHandler.removeEventListener('hardwareBackPress', ()=>{return true})
  AppState.removeEventListener('change', this._handleAppStateChange);

}

_handleAppStateChange = (nextAppState) => {
  if (nextAppState == "active" && this.sessionStore.isPopulated) {
      this.forceRedirect()
  }
}


 
 /**
   * If the user has interrupted sme search after submitting a question,
   * send them back to the home screen because their question and chat room
   * have already been deleted because of the interruption. 
   * 
   */
  forceRedirect = () => {
    if (this.sessionStore.isOp && Object.keys(this.sessionStore.chatPartner).length == 0 && 
      this.qStore.question != "" && this.qStore.questionId != "") {
        this.onGoHome()
      }
  }


/**
 * Handle socket alerts from the other user. If a disconnect alert 
 * is received, then call on this user's onDisconnect with the correct
 * mode. If the alert came from sme, then the mode is set to null. That 
 * way, op gets to decide whether they want to end the chat completely 
 * or look for another sme. If, however, the alert came from op, then
 * the mode is always set to "End" so that sme's connection is fully
 * terminated. 
 */
alertHandler = (alert) => {
  if (alert == this.sessionStore.events.alerts.leave) {
    this.onLeave()
  }
  
}
/**
 * Handle the disconnection of the current user's chat partner. Disable
 * the input box but keep the "end" conrol option intact.
 */
onLeave = () => {
  this.crStore.editable         = false
  this.crStore.userDisconnected = true
  this.crStore.partnerOnline    = false
  this.crStore.buttonTextColor  = GREY
  let data = {
    roomId: this.qStore.questionId,
    isOp: this.sessionStore.isOp,
    isSme: this.sessionStore.isSme
  }
  this.qStore.questionId = ""
  this.qStore.question = ""
  if (this.sessionStore.isSme) { this.qStore.value = "" }
  this.sessionStore.socket.emit(this.sessionStore.events.leave, data)
}


/**
 * Reset states for a new connection to the server.  If user is op,
 * emit the preamble.
 */
onNewConnection = () => {
  let newData = []
  let keys = {}
  let preamble = {
    question: this.qStore.question,
    questionId: this.qStore.questionId,
    chatId: this.sessionStore.chatPartner.chatId,
    key: shortid.generate(),
    isPreamble: true
  }
  keys[preamble.key] = true
  if (this.sessionStore.isOp) {
    // the preamble can only be created by op
    this.sessionStore.socket.emit(this.sessionStore.events.message, preamble)
  }  
    this.sessionStore.socket.emit(this.sessionStore.events.isTyping, {isTyping: false})
    newData.push(preamble)
    this.crStore.showConnectionDialog = true 
    this.crStore.connected            = false
    this.crStore.partnerOnline        = false
    this.crStore.showControls         = false
    this.crStore.editable             = false
    this.crStore.isTyping             = false
    this.crStore.data                 = newData
    this.crStore.keys                 = keys
    this.crStore.buttonText           = CANCEL
    this.crStore.buttonTextColor      = TOMATO 
    this.crStore.onSubmit             = this.sessionStore.isSme ? this.onGoToDeck : this.onGoHome
    
}
/**
 * Delete the current question from the server and navigate back to the 
 * home screen.
 */
  onGoHome = () => {
    let data = {
      userId: this.sessionStore.userId,
      questionId: this.qStore.questionId
    }
    if (this.crStore.buttonText == CANCEL) {
      request(data, this.sessionStore.endpoints.question, this.sessionStore.endpoints.methods.delete).then((result) => {
        this.props.navigation.navigate("Home")
      }).catch((err)=> {
          DEBUG && console.log(err)
          this.props.navigation.navigate("Home")
      }) 
    } else { this.props.navigation.navigate("Home")}
  }
  
  onGoToDeck = () => {
    this.props.navigation.navigate("Answer") 
  }

  onConnection = () => {
    this.crStore.showConnectionDialog   = false
    this.crStore.connected              = true
    this.crStore.partnerOnline          = true
    this.crStore.showControls           = true
    this.crStore.userDisconnected       = false
    this.crStore.editable               = true
    this.crStore.isTyping               = false
    this.crStore.buttonText             = SEND
    this.crStore.onSubmit               = this.onSend
   
  }

  onChangeText = (text) => {
    this.crStore.message = text
    let isTyping = text.trim().length > 0
    this.sessionStore.socket.emit(this.sessionStore.events.isTyping, {isTyping: isTyping})
  }

  /**
   * Add a chat message to the data array. Make sure that there
   * are no duplicate keys.
   */
  addChatMessage = (data) => {
    if (!this.crStore.keys[data.key]) {
      let newData = this.crStore.data.slice(0)
      newData.unshift(data)
      this.crStore.data = newData
      this.crStore.keys[data.key] = true
    }
  }

  onSend = () => {
    if (this.crStore.message.trim().length == 0) {return}
    if (this.crStore.connected && this.crStore.partnerOnline) {
      let chatLog = {
          fromId: this.sessionStore.userId,
          toId: this.sessionStore.chatPartner.userId,
          message: this.crStore.message,
          chatId: this.sessionStore.chatPartner.chatId,
          questionId: this.qStore.questionId,
          key: shortid.generate(),
      }
      this.addChatMessage(chatLog)
      this.sessionStore.socket.emit(this.sessionStore.events.message, chatLog)
    }
    this.crStore.message = ""
    this.sessionStore.socket.emit(this.sessionStore.events.isTyping, {isTyping: false})
  }

  renderConnectionDialog = () => {
    if (this.crStore.showConnectionDialog) {
      return (
        <View style={[styles.container, styles.indicator]}>
          <ActivityIndicator size="large" color="tomato"/>
          {this.sessionStore.isOp && 
            <View>
              <Text style={styles.opMajor}>{PROGRESS_TEXT_OP_Major}</Text>
              <Text style={styles.opMinor}>{PROGRESS_TEXT_OP_Minor}</Text>
            </View>
          }
          {this.sessionStore.isSme && 
            <Text style={styles.sme}>{PROGRESS_TEXT_SME}</Text>
          }
        </View>
      )
    }
    else { return null}
  }
    
    render() {
      return (
       
        <View style={styles.container}>
            <ChatTopBar 
                goHome={this.onGoHome}
                goToDeck={this.onGoToDeck}
                endChat={this.onLeave}/>
        <View 
            style={{flex: 1}}>
       
            {this.crStore.connected && <ChatMessageList 
                isChatRoom={true}/>
            }

                {this.renderConnectionDialog()}
              
                <ChatMessageInput
                  onChangeText={this.onChangeText}
                  message={this.crStore.message}/>
              </View>
            </View>
      );
    }
  }
  const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      indicator: {
        padding: 10,
        paddingTop: "50%",
      },
      sme: {
        textAlign: 'center',
        paddingTop: 40,
        fontSize: 16,
      },
      opMajor: {
        textAlign: 'center',
        paddingTop: 40,
        fontSize: 16,
      },
      opMinor: {
        textAlign: 'center',
        paddingTop: 5,
        fontSize: 13,
      },
       
  });
  

  