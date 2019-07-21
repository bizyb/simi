import React, {Component} from 'react';
import {
    StyleSheet, 
    View, 
    Text,
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
        // If the user has previously logged in, then load the 
        // app. Otherwise, continue with the login screen
        AsyncStorage.getItem('userId').then((value) => {
            this.sessionStore.asyncHasReturned = true
            if (value) {
                this.sessionStore.userId = value
                this.setFirstName()
                this.download()
            }
        }).catch((err) => {
            DEBUG && console.log(err)
        })
    }

    /**
     * Query the server and prepopulate all the relevant screens
     */
    download = () => {
        let data = {
            userId: this.sessionStore.userId,
          }
        request(data, endpoints.download, endpoints.methods.get).then((result) => {
            this.kbStore.data               = result.knowledgeBaseData
            this.iStore.data                = result.inboxData
            this.sessionStore.isPopulated   = true
            this.sessionStore.isNewUser     = result.isNewUser
            this.sessionStore.events        = result.events 
            this.sessionStore.endpoints     = result.endpoints
            userIsOnline(this.sessionStore.userId, 
                            this.sessionStore.endpoints.user, 
                            this.sessionStore.endpoints.methods.post)
            this.initSocket()
            this.props.navigation.navigate('Home')
          }).catch((err) => {
            DEBUG && console.log(err)
          })
        
    }

    /**
     * Open a socket connection and setup listeners for the indicated 
     * actions.
     */
    initSocket = () => {
        this.sessionStore.socket =  io.connect(this.sessionStore.endpoints.root)
        
        this.sessionStore.socket.on(this.sessionStore.events.connect, () => {
            let data = {
                userId: this.sessionStore.userId
            }
            this.sessionStore.socket.emit(this.sessionStore.events.onUserId, data)

            // Set a listener for reconnect event
            this.sessionStore.socket.on(this.sessionStore.events.reconnect, () => {
                //pass
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
    render() {
        // If AsyncStorage hasn't returned yet, then just show a blank screen
        // This is better than flashing the login screen and then navigating 
        // to Home if userId has been found
      return (
          <View style={{flex: 1}}>{!this.sessionStore.asyncHasReturned && null
          }
          {this.sessionStore.asyncHasReturned && !this.sessionStore.userId &&
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

    }
  });

  