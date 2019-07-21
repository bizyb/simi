import React, {Component} from 'react';
import {
    StyleSheet, 
    View, 
    Text,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Logo from './Logo';
import Slogan from './Slogan';
import LegalDisclaimer from './LegalDisclaimer';
import OvalButton from '../buttons/OvalButton';
import strings from "../../assets/en/json/strings.json";
import { 
    privacyUrl, 
    ToSUrl,
    request,
} from "../../api/api";
import endpoints from "../../api/endpoints";
import { 
    LoginManager,
    AccessToken,
    GraphRequest,
    GraphRequestManager } from "react-native-fbsdk";
import {observer,inject} from 'mobx-react';
import io from 'socket.io-client';
import { DEBUG } from "../../../settings";
import { userIsOnline } from "../../utils/utils";

let FACEBOOK_TEXT = strings.login.facebookButton;
let FACEBOOK_PROVIDER = "Facebook";
let ERR_MESSAGE = strings.login.errorMessage

@inject('rootStore')
@observer
export default class Login extends Component {
    sessionStore = this.props.rootStore.sessionStore
    kbStore = this.props.rootStore.knowledgeBaseStore
    iStore = this.props.rootStore.inboxStore
    qdStore = this.props.rootStore.questionDeckStore

    static navigationOptions = {
        header: null,
    };
    
    componentDidMount() {
        this.getUserId()
        
    }
    
    getUserId = async () => {
        let value = await AsyncStorage.getItem('userId')
        if (value) {
            this.sessionStore.userId = value
            this.setFirstName()
            this.download()
        } 

    }

    /**
     * Query the server and prepopulate all the relevant screens
     */
    download = () => {
        DEBUG && console.log("==== Attempting to download user data===")
        this.sessionStore.downloadComplete = false
        let data = {
            userId: this.sessionStore.userId,
          }
        request(data, endpoints.download, endpoints.methods.get).then((result) => {
            DEBUG && console.log("Download Result: ", result)
            this.kbStore.data               = result.knowledgeBaseData
            this.iStore.data                = result.inboxData
            this.sessionStore.isPopulated   = true
            this.sessionStore.isNewUser     = result.isNewUser
            this.sessionStore.events        = result.events 
            this.sessionStore.endpoints     = result.endpoints
            this.sessionStore.downloadComplete = true
            this.sessionStore.downloadError    = false
            userIsOnline(this.sessionStore.userId, 
                            this.sessionStore.endpoints.user, 
                            this.sessionStore.endpoints.methods.post,
                            isOnline=true)
            this.initSocket()
            this.props.navigation.navigate('Home')
          }).catch((err) => {
            DEBUG && console.log(err)
            this.sessionStore.downloadError = true
          })
        
    }

    

    /**
     * Open a socket connection and setup listeners for the indicated 
     * actions.
     */
    initSocket = () => {
        DEBUG && console.log("Attempting to init socket connection to: ", this.sessionStore.endpoints.socketRoot)
        this.sessionStore.socket =  io.connect(this.sessionStore.endpoints.socketRoot)
        
        this.sessionStore.socket.on(this.sessionStore.events.connect, () => {
            DEBUG && console.log("Socket connection made")
            let data = {
                userId: this.sessionStore.userId
            }
            this.sessionStore.socket.emit(this.sessionStore.events.onUserId, data)

            // Set a listener for reconnect event
            this.sessionStore.socket.on(this.sessionStore.events.reconnect, () => {
                DEBUG && console.log("Socket reconnected")
            })
        })   
    }

    /**
     * Save the user's first name to sessionStore. The first name is 
     * used when creating the chat room record, which is eventually
     * used to populate inbox item header.
     */
    setFirstName = async () => {
        this.sessionStore.firstName = await AsyncStorage.getItem("first_name")
    }    
    async FBGraphRequest(fields, callback) {
        const accessData = await AccessToken.getCurrentAccessToken();

        // Create a graph request asking for user information
        const infoRequest = new GraphRequest('/me', {
          accessToken: accessData.accessToken,
          parameters: {
            fields: {
              string: fields
            }
          }
        }, callback.bind(this));
        // Execute the graph request created above
        new GraphRequestManager().addRequest(infoRequest).start();
      }
    
      async FBLoginCallback(error, result) {
        if (error) {
          DEBUG && console.log("Error encountered with login")
          DEBUG && console.log(error)
        } else {
          // Retrieve and save user details
            let userData = {
                facebookId: result.id,
                picture: result.picture.data.url, 
                email: result.email,
                last_name: result.last_name, 
                first_name: result.first_name,
            }
            request(userData, endpoints.login, endpoints.methods.post).then((newRes) => {
                this.setUserInfo(userData, newRes.userId)
            }).catch((err) => {
                DEBUG && console.log(err)
            })
        }
      }
   
    /*
      Save user info to device 
     */
    setUserInfo = async (userData, userId) => {
        this.sessionStore.userId = userId
        await AsyncStorage.setItem('picture', userData.picture)
        await AsyncStorage.setItem('last_name', userData.last_name)
        await AsyncStorage.setItem('first_name', userData.first_name)
        await AsyncStorage.setItem('userId', userId)
        this.download() 
    }

    loadPrivacy = () => {
        this.props.navigation.navigate('WebView', {"url": privacyUrl()})
    }
  
    loadToS = () => {
    this.props.navigation.navigate('WebView', {"url": ToSUrl()})
    }


    auth = (provider) => {
        if (provider == FACEBOOK_PROVIDER) {
            LoginManager.logInWithPermissions(["public_profile", "email"]).then((result)=> {
                if (result.isCancelled) {
                    DEBUG && console.log("Login was cancelled")
                } else {
                    let fields = "first_name, last_name, email, picture.type(large)"
                    this.FBGraphRequest(fields, this.FBLoginCallback)
                }
            }, (err) => {
                DEBUG && console.log("Error occurred: ", err)
            })
        }
    }
    renderDownloadProgress = () => {
        if (this.sessionStore.downloadComplete) { return null}
        else {
            if (this.sessionStore.downloadError) {
                return (
                    <View style={styles.indicator}>
                        <ActivityIndicator color="tomato" size="large" animating={false}/>
                        <Text style={styles.downloadError}>{ERR_MESSAGE}</Text>
                    </View>
                )
            } else {
                return (
                    <View style={styles.indicator}>
                    <ActivityIndicator color="tomato" size="large"/>
                </View>
                )
            } 
        }
    }

    render() {
      return (
          <View style={{flex: 1}}>
          {this.sessionStore.userId && !this.sessionStore.downloadComplete
            && this.renderDownloadProgress()
          }
          {!this.sessionStore.userId &&
          <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Logo/>
                </View>
                <View style={styles.sloganContainer}>
                    <Slogan/>
                </View>
                <View style={styles.buttonContainer}>
                    <OvalButton 
                            provider={"facebook"}
                            container={styles.facebookContainer} 
                            text={FACEBOOK_TEXT}
                            onPress = {() => this.auth(FACEBOOK_PROVIDER)}/>
                </View>
                <View style={styles.legalContainer}>
                    <LegalDisclaimer loadPrivacy={this.loadPrivacy} loadToS={this.loadToS}/>
                </View>
               
          </View> 
          }
          </View>
      );
    }
  }
  
  
  const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      logoContainer: {
          flex: 1,
          paddingTop: 50,
      },
      buttonContainer: {
        flex: 1,
        marginTop: -50,
      },
      sloganContainer: {
        flex: 1,
        marginTop: -50,
      },
    googleContainer: {
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    facebookContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    legalContainer: {
        flex: 1,
    },
    loginOptions: {
        textAlign: 'center',
        paddingTop: 20,
        color: 'grey',
        fontSize: 12,

    },
    indicator: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      downloadError: {
          paddingTop: 15,
      }
  });

  