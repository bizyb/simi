import { DEBUG } from "../../settings";
import moment from 'moment'

/**
 * Return a unix timestamp in human-readable format.
 * 
 * @param {*} _for page where the date will be used
 * @param {*} date unix timestamp 
 */
export function getDate(_for, date) {
    let formattedDate = moment(date).fromNow()
    if (_for == "chat") {
        formattedDate = moment(date).format('MMMM Do YYYY')
    }
    return formattedDate
}