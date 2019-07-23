// import React, {Component} from 'react';
import { DEBUG } from "../../settings";
import endpoints from "../api/endpoints";
import { request } from "../api/api";
import { 
    LoginManager,
    AccessToken,
    GraphRequest,
    GraphRequestManager } from "react-native-fbsdk";
import {
  GoogleSignin,
  statusCodes,
} from 'react-native-google-signin';
import strings from "../assets/en/json/strings.json"; 
let FACEBOOK_PROVIDER = strings.login.facebookProvider;
let GOOGLE_PROVIDER = strings.login.googleProvider;
let reactCallback = null // bad idea but no other way

const FBLoginCallback = async (error, result) => {
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
            userData.userId = newRes.userId
            reactCallback(userData)
        }).catch((err) => {
            DEBUG && console.log(err)
        })
    }
}

const FBGraphRequest = async (fields, callback) => {
    const accessData = await AccessToken.getCurrentAccessToken();

    // Create a graph request asking for user information
    const infoRequest = new GraphRequest('/me', {
      accessToken: accessData.accessToken,
      parameters: {
        fields: {
          string: fields
        }
      }
    }, FBLoginCallback.bind(this))
    // Execute the graph request created above
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  const googleSignin = async (callback) => {
    //Prompts a modal to let the user sign in into your application.
    try {
      await GoogleSignin.hasPlayServices({
        //Check if device has Google Play Services installed.
        //Always resolves to true on iOS.
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      DEBUG && console.log("Google Sigin raw data: ", userInfo)
      let userData = {
        googleId: userInfo.user.id,
        picture: userInfo.user.photo, 
        email: userInfo.user.email,
        last_name: userInfo.user.familyName, 
        first_name: userInfo.user.givenName,
    }
    DEBUG && console.log("Google Sigin user data: ", userData)
    request(userData, endpoints.login, endpoints.methods.post).then((newRes) => {
        userData.userId = newRes.userId
        callback(userData)
    }).catch((err) => {
        DEBUG && console.log(err)
    })
    } catch (error) {
        DEBUG && console.log('Message', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        DEBUG && console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        DEBUG && console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        DEBUG && console.log('Play Services Not Available or Outdated');
      } else {
        DEBUG && console.log('Some Other Error Happened');
      }
    }
  };
export function auth(provider, callback)  {
    reactCallback = callback
    if (provider == FACEBOOK_PROVIDER) {
        LoginManager.logInWithPermissions(["public_profile", "email"]).then((result)=> {
            if (result.isCancelled) {
                DEBUG && console.log("Login was cancelled")
            } else {
                let fields = "first_name, last_name, email, picture.type(large)"
                FBGraphRequest(fields, callback)
            }
        }, (err) => {
            DEBUG && console.log("Error occurred: ", err)
        })
    } else if (provider == GOOGLE_PROVIDER) {
        googleSignin(callback)
    }
}
