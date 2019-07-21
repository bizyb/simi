import React, {Component} from 'react';
import {    
    StyleSheet, 
    View, 
    Text,
    Image,
} from 'react-native';
import Dialog from "react-native-dialog";
import StarRating from 'react-native-star-rating';
import { Dialog as StarRatingDialog} from 'react-native-simple-dialogs';
import strings from "../../assets/en/json/strings.json";
import {observer,inject} from 'mobx-react';


let END_CHAT_DESC =  strings.chat.endChatDesc;
let FEEDBACK_DESC = strings.chat.feedbackDesc;
let IS_TYPING = strings.chat.isTyping;
let END = strings.chat.end;
let CANCEL = strings.global.cancel;
let OK = strings.global.ok;
let CONNECTED = strings.chat.connected;
let DISCONNECTED = strings.chat.disconnected;

@inject('rootStore')
@observer
export default class ChatTopBar extends Component<Props> {
    ctbStore = this.props.rootStore.chatTopBarStore
    crStore = this.props.rootStore.chatRoomStore
    sessionStore = this.props.rootStore.sessionStore
    qStore = this.props.rootStore.questionStore
    
    componentDidMount() {
        this.ctbStore.starCount = 0
    }
    
    onStarRatingPress(rating) {
        this.ctbStore.starCount = rating
    }

    showEndChatDialog = () => { this.ctbStore.showEndChatDialog = true } 
    hideEndChatDialog = () => { 
        this.ctbStore.showEndChatDialog = false 
    } 
    showFeedbackDialog = () => { 
        this.hideEndChatDialog()
        this.ctbStore.showFeedbackDialog    = true
        this.crStore.userDisconnected       = true
        this.crStore.isTyping               = false
        this.props.endChat()
    }
    

    /**
     * Hide the feedback dialog box if a rating is given, otherwise
     * keep showing the dialog box. If a rating is given, send it to
     * the server
     */
    hideFeedbackDialog = () => {
        
        this.crStore.userDisconnected = false
        if (this.ctbStore.starCount == 0) { return}
        let data = {
            rating: this.ctbStore.starCount,
            questionId: this.qStore.questionId,
            chatId: this.sessionStore.chatPartner.chatId
        }
        if (this.sessionStore.isSme) {
            data["smeId"] = this.sessionStore.userId
            data["opId"] = this.sessionStore.chatPartner.userId
        } else {
            data["opId"] = this.sessionStore.userId
            data["smeId"] = this.sessionStore.chatPartner.userId
        }
        // save the rating
        this.sessionStore.socket.emit(this.sessionStore.events.feedback, data)

        
        this.ctbStore.showFeedbackDialog    = false
        this.ctbStore.starCount             = 0 
        if (this.ctbStore.feedbackCallback != null) {
            let callback = this.ctbStore.feedbackCallback
            this.ctbStore.feedbackCallback = null
            callback()
        }
        else {
            // send op to the homepage but send sme to the swipe deck
            if (this.sessionStore.isOp) { this.props.goHome() }
            else { this.props.goToDeck() }  
        }
         
    }
    hideNextSMEDialog = () => { this.ctbStore.showNextSMEDialog = false } 
    showNextSMEDialog = () => { this.ctbStore.showNextSMEDialog =true  }
    
    renderStatusBar = () => {
        if (this.crStore.connected) {
            return (
                <View style={styles.connectedContainer}>
                    <Image source={{uri: this.sessionStore.chatPartner.picture}} style={styles.profileImage}/>
                    {!this.crStore.userDisconnected &&
                        <Text style={[styles.bulletPoint, styles.connectedColor]}>•</Text>
                    }
                    {this.crStore.userDisconnected && 
                        <Text style={[styles.bulletPoint, styles.disconnectedColor]}>•</Text>
                    }
                    <View style={styles.userNameContainer}>
                        <Text style={styles.userNameText}>{this.sessionStore.chatPartner.name}</Text>
                        { this.crStore.isTyping && 
                            <Text style={styles.isTypingText}>{IS_TYPING}</Text>
                        }
                        {!this.crStore.isTyping && !this.crStore.userDisconnected &&
                            <Text style={styles.connectedText}>{CONNECTED}</Text>
                        }
                        {!this.crStore.isTyping && this.crStore.userDisconnected &&
                            <Text style={styles.connectedText}>{DISCONNECTED}</Text>
                        }
                    </View>  
                </View>
            )
        } else {
            return null
    }
}
    
    renderEndChatDialog = () => {
        
        return (
            <View>
              <Dialog.Container visible={this.ctbStore.showEndChatDialog}>
                <Dialog.Description>
                  {END_CHAT_DESC}
                </Dialog.Description>
                <Dialog.Button 
                    label={CANCEL} 
                    onPress={this.hideEndChatDialog}
                    />
                <Dialog.Button 
                    label={OK} 
                    onPress={this.showFeedbackDialog}
                    />
              </Dialog.Container>
            </View>
          )
    }
    renderFeedbackDialog = () => {
        return (
            <StarRatingDialog
                visible={this.ctbStore.showFeedbackDialog}
                onTouchOutside={this.hideFeedbackDialog}>
                <View style={styles.starRatingContainer}>
                    <Text style={styles.starRatingText}>{FEEDBACK_DESC}</Text>
                <StarRating
                        disabled={false}
                        fullStarColor={'tomato'}
                        maxStars={5}
                        rating={this.ctbStore.starCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                    />
                </View>
            </StarRatingDialog>
          )
    }

    render() {
        
      return (
    
            <View style={[styles.topBar, this.crStore.connected ? styles.topBarBorder: {}]}>
                {this.renderStatusBar()}
                {this.renderEndChatDialog()}
                {this.renderFeedbackDialog()}
                {this.crStore.showControls  &&
                <View style={styles.controls}>
                    <Text 
                        style={styles.rightText}
                        onPress={this.showEndChatDialog}>{END}</Text>
                </View>
                }
            </View>
      );
    }
  }
  const styles = StyleSheet.create({
   
   topBar: {
        height: 70, 
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        
   },
   topBarBorder: {
        borderBottomWidth: 1,
        borderColor: '#eeeeee',
   },
      connectedText: {
        color: 'grey',
        fontSize: 12,
        textAlign: "left",
        paddingTop: 2,
      },
      isTypingText: {
        color: 'tomato',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: "left",
        paddingTop: 2,
      },
      connectedContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingLeft: '15%',
        alignContent: 'flex-end',
        justifyContent: 'flex-end',
        
      },
      dotContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingLeft: '10%', 
      },
      rightText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e8491b',
        paddingRight: 20,
        paddingTop: 8,
        alignContent: 'flex-end',
        justifyContent: 'flex-end',
      },
      controls: {
          flexDirection: 'row',  
      },
      starRatingContainer: {
          padding: 5,
      },
      starRatingText: {
          paddingTop: 5,
          paddingBottom: 20,
      } ,
      profileImage: {
          width: 40,
          height: 40,
          borderRadius: 50,
      },
      userNameContainer: { 
          flexDirection: 'column',
          width: "100%",
          paddingLeft: 10
      },
      userNameText: {
          color: 'black',
          fontWeight: 'bold',
      },
      bulletPoint: {
          fontSize: 60,
          marginTop: -30,
          marginLeft: -10,
          paddingTop: 20,
      },
      connectedColor: {
        color: '#29DC20',
      },
      disconnectedColor: {
          color: 'grey',
      }
  });