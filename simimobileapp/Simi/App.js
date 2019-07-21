import React, {Component} from 'react';
import strings from "./src/assets/en/json/strings.json";
import Login from "./src/components/login/Login";
// import KnowledgeBase from "./src/components/dashboard/kb/KnowledgeBase";
import Inbox from './src/components/dashboard/inbox/Inbox';
import ChatLog from './src/components/dashboard/inbox/ChatLog';
import QuestionDeck from './src/components/dashboard/deck/QuestionDeck';
import QuestionInput from './src/components/dashboard/question/QuestionInput';
import ChatRoom from "./src/components/chat/ChatRoom";
import WebViewLoader from "./src/components/utils/WebViewLoader";
import IconKB from 'react-native-vector-icons/Entypo';
import IconCards from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
  createAppContainer
} from 'react-navigation';
import IconWithBadge from './src/components/dashboard/inbox/IconWithBadge';
import RootStore from "./src/stores/RootStore";
import { Provider } from 'mobx-react';
import { AppState, StatusBar } from 'react-native';
import { request } from "./src/api/api";
import { DEBUG } from "./settings";
import { userIsOnline } from "./src/utils/utils";
// import AsyncStorage from '@react-native-community/async-storage';

const rootStore = new RootStore();

type Props = {};

const getTabBarIcon = (navigation, focused, tintColor) => {
  const { routeName } = navigation.state
  if (routeName === "Inbox") {
    return <IconWithBadge
              name={"message-square"}
              color={tintColor}
              size={24}/>
  } 
  else if (routeName == "KnowledgeBase") {
    return <IconKB name={"book"} color={tintColor} size={24} />;
  }
  else if (routeName == "Answer") {
    return <IconCards name={"cards-outline"} color={tintColor} size={24} />;
  }
  else if (routeName == "Ask") {
    return <IconCards name={"human-greeting"} color={tintColor} size={24} />;
  }
  
};

const ChatStack = createStackNavigator(
  {
    ChatRoom: ChatRoom,
  }
)

const AuthStack = createStackNavigator(
  {
    Login: Login,
    WebView: WebViewLoader,
  },
  {
    initialRouteName: 'Login',
  }
) 
const InboxStack = createStackNavigator(
  {
    Inbox: Inbox,
    InboxWebView: WebViewLoader,
    ChatLog: ChatLog,
  },
  
  {
   initialRouteName: 'Inbox',
  }
)

InboxStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};


const DashboardTabNavigator = createBottomTabNavigator(
  // todo: refer to the following link for adding a badge (inbox unread count): lost it
  {

    // KnowledgeBase: { 
    //   screen: KnowledgeBase ,
    //   navigationOptions: {
    //     title: strings.global.knowledgeBase,
    //   }
    // },
    Ask: {
      screen: QuestionInput,
      navigationOptions: {
        title: strings.global.ask,
      } 
    },
    Inbox: { 
      screen: InboxStack,
      navigationOptions: {
        title: strings.global.inbox,
      }
     },
    Answer: {
      screen: QuestionDeck,
      navigationOptions: {
        title: strings.global.answer,
      }
    }
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
       return getTabBarIcon(navigation, focused, tintColor);
      }
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    initialRouteName: 'Ask',
    order: ["Ask", "Answer", "Inbox"]
  },
)

const AppSwitch = createSwitchNavigator(
  {
    Auth: AuthStack,
    Home: DashboardTabNavigator,
    ChatRoom: ChatStack,
  },
  {
    initialRouteName: 'Auth',
  }
)

export default class App extends Component<Props> {

  sessionStore  = rootStore.sessionStore
  qStore        = rootStore.questionStore

  componentDidMount() {
    StatusBar.setBarStyle('dark-content', true)
    StatusBar.setBackgroundColor('transparent')
    AppState.addEventListener('change', this._handleAppStateChange)
    // this.getEndpoint()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  /**
   * Get the mobile app endpoint for REST and socket.io requests.
   * The server endpoint can change frequently in the future so we 
   * don't hardcode it. However, we only hardcarde the address to
   * the gateway server, which allows us to change the mobile app 
   * endpoint and retrieve it dynamically.
   */
  // getEndpoint = async () => {
  //   const fileName = "./src/api/endpoints/endpoints.json"
  //   const gateway = "https://simichat.net/api/endpoint"
  //   const response = await fetch(gateway)
  //   const json = await response.json()
  //    // what if there was an error at the server?
  //   if (!json.endpoint) {
  //     DEBUG && console.log("Mobile endpoint not found")
  //     // alert they should try again, etc. and redirect to 

  //   }
  //   await AsyncStorage.setItem("mobileEndpoint", json.endpoint)
    
  // }

  cleanup = () => {
    DEBUG && console.log("Attempting session cleanup")
    let data = {
        userId: this.sessionStore.userId,
        questionId: this.qStore.questionId,
    }
    let endpoint = this.sessionStore.endpoints.cleanup
    let method = this.sessionStore.endpoints.methods.post
    request(data, endpoint, method).then((result) => {
        DEBUG && console.log(result)
      }).catch((err) => {
        DEBUG && console.log(err)
      })

  }


  _handleAppStateChange = (nextAppState) => {
    if (nextAppState != "active") {
      DEBUG && console.log("App state: ", nextAppState)
      try {
        this.cleanup()
      } catch(err) {
        DEBUG && console.log(err)
      }
    }
  }
  
  render() {
    return (
      <Provider rootStore={rootStore}>
        <AppContainer/> 
      </Provider>  
    )
  }
}

const AppContainer = createAppContainer(AppSwitch)
