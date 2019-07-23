import legalJson from "../assets/en/json/legal.json";
import axios from "axios";
import endpoints from "../api/endpoints"
import { DEBUG } from "../../settings";

/**
 * Perform server api calls to a given endpoint using 
 * the method specified on the data given.
 * 
 * @param {*} data 
 * @param {*} endpoint 
 * @param {*} method 
 */
export function request(data, endpoint, method) {
    return new Promise ((resolve, reject) => {
        axios({
            method: method,
            url: endpoints.root + endpoint,
            data: data,
            params: data,
        })
        .then((response) => {
            resolve(response.data)
        })
        .catch((err) => {
            reject(err)
        })
    })    
}

/**
 * Let the server know that the user is online.
 */
export function userIsOnline(userId, endpoint, method, isOnline=false) {
    let data = {
        userId: userId,
        isOnline: isOnline
    }
    DEBUG && console.log("Setting userIsOnline status: ", data)
    request(data, endpoint, method).then((result) => {
        DEBUG && console.log(result)
    }).catch((err)=> {
        DEBUG && console.log(err)
    })
}

export function join(sessionStore, qStore) {
    let data = {
        userId: sessionStore.userId,
        roomId: qStore.questionId,
        firstName: sessionStore.firstName,
        question: qStore.question,
        questionId: qStore.questionId,
        isOp: sessionStore.isOp,
        isSme: sessionStore.isSme,
    }
    DEBUG && console.log("About to join a room with data: ", data)
    sessionStore.socket.emit(sessionStore.events.join, data)
}

export function privacyUrl() {
    return legalJson["Privacy"]
}

export function ToSUrl() {
    return legalJson["ToS"]
}