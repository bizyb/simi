import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  Animated, 
  PanResponder,
  ActivityIndicator } from 'react-native';
const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
import CardStack from './CardStack';
import CommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import strings from "../../../assets/en/json/strings.json";
import {observer,inject} from 'mobx-react';
import { request, join } from "../../../api/api";
import { DEBUG } from "../../../../settings";
import StaleQuestion from './StaleQuestion';


let EMPTY_DECK = strings.deck.empty;
let ACCEPT = strings.deck.accept;
let PASS = strings.deck.pass;
let STALE = strings.deck.stale;


@inject('rootStore')
@observer
export default class QuestionDeck extends Component<Props> {

    qdStore = this.props.rootStore.questionDeckStore
    qStore = this.props.rootStore.questionStore
    sessionStore = this.props.rootStore.sessionStore
    focusListener = this.props.navigation.addListener("didFocus", () => {
      // The screen is focused
      this.onSwipeDeck()
    })



    position = new Animated.ValueXY()
    intervalID = 0
   
    rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    })

    rotateAndTranslate = {
      transform: [{
        rotate: this.rotate
      },
      ...this.position.getTranslateTransform()
      ]
    }

    likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })
    dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp'
    })
    nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    })

  componentWillMount() {
    
    this.PanResponder = PanResponder.create({

      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {

        this.position.setValue({ x: gestureState.dx, y: gestureState.dy })
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.setUserStatus()
        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
          }).start(() => {
            this.qdStore.currentIndex = this.qdStore.currentIndex + 1
            this.position.setValue({ x: 0, y: 0 })
            this.reformQueue()
            this.rightSwipeHandler()
          })
          
        }
        else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.qdStore.currentIndex = this.qdStore.currentIndex + 1
            this.position.setValue({ x: 0, y: 0 })
            this.reformQueue()
          })
          
        }
        else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 100
          }).start()
        }
      }
    })
  }

  
  componentWillUnmount() {
    this.focusListener.remove();
  }

 
onSwipeDeck = () => {
  this.qdStore.currentIndex = 0
  let data = {
    userId: this.sessionStore.userId
  }
  request(data, this.sessionStore.endpoints.swipeDeck, this.sessionStore.endpoints.methods.get).then((result) => {
    this.qdStore.questions = result.queue
  }).catch((err) => {
      DEBUG && console.log(err)
  })
}

 /**
 * Check with the server if this sme should join the chat room.
 * If so, join the chat room.
 */
rightSwipeHandler = () => {

  let index = this.qdStore.currentIndex - 1
  this.sessionStore.isOp = false
  this.sessionStore.isSme = true
  this.qStore.question = this.qdStore.questions[index].question
  this.qStore.questionId = this.qdStore.questions[index].questionId
  let data = {
    questionId: this.qStore.questionId
  }
  
  request(data, this.sessionStore.endpoints.rightSwipe, this.sessionStore.endpoints.methods.get).then((result) => {
    DEBUG && console.log("rightSwipe: ", result)
    if (result.canJoin) {
      join(this.sessionStore, this.qStore)
      this.props.navigation.navigate("ChatRoom")
    } else {
      // sme not allowed to join because
      // 1. someone else is already answering the question
      // 2. the question has already been answered (stale)
      // 3. the question has been cancelled/deleted (stale)
      this.qdStore.showStaleQWarning = true
      setTimeout(()=> {this.qdStore.showStaleQWarning = false}, 1000)
    }
  }).catch((err) => {
      DEBUG && console.log(err)
  })
}

reformQueue = () => {
  let index = this.qdStore.currentIndex - 1
  if (index >= 0) {
    data = {
      userId: this.sessionStore.userId,
    }
    request(data, this.sessionStore.endpoints.reformQueue, this.sessionStore.endpoints.methods.post).then((result) => {
      DEBUG && console.log(result)
    }).catch((err)=> {
      DEBUG && console.log(err)
    })
  }
  
}


setUserStatus = () => {
    if (this.sessionStore.isNewUser) {
      this.sessionStore.isNewUser = false
      let data = {
        userId: this.sessionStore.userId,
        isNewUser: false
      }
      request(data, this.sessionStore.endpoints.user, this.sessionStore.endpoints.methods.post).then((result) => {
        DEBUG && console.log(result)
      }).catch((err)=> {
        DEBUG && console.log(err)
      })
    }
  }

 
  renderStaleWarning = () => {
    return (
      <View>
        {this.qdStore.showStaleQWarning &&
        <Text style={styles.staleText}>{STALE}</Text>
        }
    </View> 
    )
  }
  renderEmpty = () => {
    return (
      <View style={styles.container}>
      <CommunityIcons name={"cards-outline"} color={'grey'} size={200}/>
      <Text style={styles.emptyDeckText}>{EMPTY_DECK}</Text>
    </View>
    )
  }

  renderPointers = () => {
    if (this.sessionStore.isNewUser) {
      return (
        <View style={styles.guide}>
          <View style={styles.leftCol}>
              <CommunityIcons name="hand-pointing-left" color="#bbbbbb" size={12}/>
              <Text style={styles.passAcceptText}>  {PASS}</Text>
          </View>
          <View style={styles.rightCol}>
              <Text style={styles.passAcceptText}>{ACCEPT}  </Text>
              <CommunityIcons name="hand-pointing-right" color="#bbbbbb" size={12}/>
          </View>
        </View>
      )
    }
    return null
  }
  
  renderQuestions = () => {
    if (this.qdStore.currentIndex == this.qdStore.questions.length) {
      return this.renderEmpty()
      
    } else {
    return this.qdStore.questions.map((item, i) => {
      if (i < this.qdStore.currentIndex) {
        return null
      }
      else if (i == this.qdStore.currentIndex) {
        return (
          <View key={item.questionId}>
          {this.renderPointers()}
          <Animated.View
            {...this.PanResponder.panHandlers} 
            style={[this.rotateAndTranslate, { 
                height: SCREEN_HEIGHT - 120, 
                width: SCREEN_WIDTH, 
                padding: 10, 
                position: 'absolute' }]}>
            <Animated.View 
                style={{ 
                    opacity: this.likeOpacity, 
                    transform: [{ rotate: '-30deg' }], 
                    position: 'absolute', 
                    top: 50, 
                    left: 50, 
                    zIndex: 1000 }}>
            <Text style={styles.accept}>{ACCEPT}</Text>

            </Animated.View>

            <Animated.View 
                style={{ 
                    opacity: this.dislikeOpacity, 
                    transform: [{ rotate: '30deg' }], 
                    position: 'absolute', 
                    top: 50, 
                    right: 50, 
                    zIndex: 1000 }}>
              <Text style={styles.reject}>{PASS}</Text>

            </Animated.View>
            <CardStack item={item}/>
          </Animated.View>
          <StaleQuestion/>
          </View>
        )
      }
      else {
        return (
          <View key={item.questionId}>
          <Animated.View
          style={[{
              opacity: this.nextCardOpacity,
              transform: [{ scale: this.nextCardScale }],
              height: SCREEN_HEIGHT - 120, 
              width: SCREEN_WIDTH, 
              padding: 10,
               position: 'absolute'
            }]}>
            <Animated.View 
                style={
                  { opacity: 0, 
                  transform: [{ rotate: '-30deg' }], 
                  position: 'absolute', 
                  top: 50, 
                  left: 40, 
                  zIndex: 1000 }}>
              <Text style={styles.accept}>{ACCEPT}</Text>
            </Animated.View>
            <Animated.View 
                style={{ 
                  opacity: 0, 
                  transform: [{ rotate: '30deg' }], 
                  position: 'absolute', 
                  top: 50, 
                  right: 40, 
                  zIndex: 1000 }}>
              <Text style={styles.reject}>{PASS}</Text>
            </Animated.View>
            <CardStack item={item}/>
          </Animated.View>
           <StaleQuestion/>
           </View>
        )
      }
    }).reverse()
  }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ height: 60 }}>

        </View>
        <View style={{ flex: 1 }}>
          {this.renderQuestions()}
        </View>
        <View style={{ height: 60 }}>
        </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    
  },
  emptyDeckText: {
    padding: 30,
    textAlign: 'center',
    fontSize: 12,
  },
  accept: { 
      borderWidth: 1, 
      borderColor: 'green', 
      color: 'green', 
      fontSize: 36, 
      fontWeight: '800', 
      padding: 5
     },
     reject: { 
        borderWidth: 1, 
        borderColor: 'black', 
        color: 'black', 
        fontSize: 36, 
        fontWeight: '800', 
        padding: 5
       },
       guide: {
        top: -30,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        height: 30,
        // zIndex: 1000,
    },
    leftCol: {
        paddingLeft: "10%",
        width: "50%",
        justifyContent: "flex-start",
        alignContent: "flex-start",
        flexDirection: 'row',
    },
    rightCol: {
      paddingRight: "10%",
      width: "50%",
      justifyContent: "flex-end",
      alignContent: "flex-start",
      flexDirection: 'row',
    },
    passAcceptText: {
        fontSize: 10,
        color: "#bbbbbb"
    },
    indicator: {
      marginTop: -35
    },
    staleText: {
      color: 'black',
      // width: '50%',
      textAlign: 'center',
      padding: 5,
  }
});