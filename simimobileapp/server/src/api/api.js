const uuid4 = require("uuid/v4")
const dbApi = require("../utils/db")
const settings = require("../../settings")


const uuid = () => {
    return uuid4().replace(/-/g, '')
}


/**
 * Append the new question to the end of the user's queue.
 * 
 * @param {*} selected an array of selected smes
 * @param {*} data question info
 */
const pushToQueue = (selected, data) => {
    for (var i = 0; i < selected.length; i++) {
        let user = selected[i]
        user.queue.push(data)
        let query = {
            userId: user.userId,
            queue: user.queue
        }
        dbApi.update(dbApi.collections.user, query).then((result) => {
            settings.DEBUG && console.log("Pushed to queue: ", result.length)
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })
    }
}

/**
 * Randomly select a set number of smes currently online and push
 * the question on their queues. 
 * @param {*} data question and questionId
 */
const findSmes = (data) => {
    let n = 100
    let numShuffle = 10
    return new Promise((resolve, reject) => {
        let query = {
		role: "user"
            //isOnline: true,
        }
        dbApi.find(dbApi.collections.user, query).then((fResult) => {
            // remove op from the result 
            fResult = fResult.filter(item => item.userId != data.op && item.queue != null)  

            // randomize and select
            let shuffled = fResult.sort(function(){return .5 - Math.random()})
            for (var i = 0; i < numShuffle; i++) {
                shuffled = fResult.sort(function(){return .5 - Math.random()})
            }
            let selected = shuffled.slice(0, n)
	//settings.DEBUG && console.log("Selected SMEs: ", selected)
            pushToQueue(selected, data)
            resolve(selected.length)
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })
    })
}

module.exports = {
    uuid: uuid,
    findSmes: findSmes,
}
