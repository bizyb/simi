import { DEBUG } from "../../settings";
import moment from 'moment'
import { request } from "../api/api"

/**
 * Return a unix timestamp in human-readable format.
 * 
 * @param {*} _for page where the date will be used
 * @param {*} date unix timestamp 
 */
export function getDate(_for, date) {
    if (_for == "inbox") {  
        return moment(date).subtract(10, 'days').calendar()
    }
    else if (_for == "chat") {
        return moment(date).format('MMMM Do YYYY')
    }
}

/**
 * Let the server know that the user is online.
 */
export function userIsOnline(userId, endpoint, method, isOnline=false) {
    let data = {
        userId: userId,
        isOnline: isOnline
    }
    request(data, endpoint, method).then((result) => {
        DEBUG && console.log(result)
    }).catch((err)=> {
        DEBUG && console.log(err)
    })
}