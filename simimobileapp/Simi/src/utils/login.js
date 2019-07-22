// import React, {Component} from 'react';
import { DEBUG } from "../../settings";
import endpoints from "../api/endpoints";
import { request } from "../api/api";
import { 
    LoginManager,
    AccessToken,
    GraphRequest,
    GraphRequestManager } from "react-native-fbsdk";
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
    }
}
