const dbApi = require("../utils/db")
const settings = require("../../settings")

/**
 * Log user activity. If an activity is locked, then create a new one.
 * Otherwise, update the unlocked activity and lock it. 
 * 
 * NB: A user cannot use the app unless they go through the login 
 * process. However, they can always exit the app without the server 
 * knowing about it (e.g. their internet connection is off). In 
 * such cases, we'll have an unlocked activity that will throw off 
 * all subsequent logging. Therefore, we need to clean it up. 
 * @param {*} userId 
 */
const activityLog = (userId, cleanup=false) => {
    let query = {
        userId: userId,
        locked: false
    }
    if (cleanup) {
        dbApi.delete(dbApi.collections.activityLog, query, many=true).then((result) =>{
            settings.DEBUG && console.log("Activity Log cleanup: ", result)
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })

    } else {
        dbApi.find(dbApi.collections.activityLog, query).then((result) => {
            if (result.length == 0) {
                query = {
                    userId: userId,
                    locked: false,
                    start: new Date()
                }
                dbApi.insert(dbApi.collections.activityLog, query).then((result) => {
                    settings.DEBUG && console.log("New activity log created")
                }).catch((err) => {
                    settings.DEBUG && console.log(err)
                })
            } else {
                query = result[0]
                query.end = new Date()
                query.locked = true
                dbApi.update(dbApi.collections.activityLog, query).then((result) => {
                    settings.DEBUG && console.log("Activity log updated and locked")
                }).catch((err) => {
                    settings.DEBUG && console.log(err)
                })  
            }
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })
    }

}

/**
 * Pop the top object from user queue and push it to the end.
 */
const reformQueue = (userId) => {
    let query = {
        userId: userId
    }
    dbApi.find(dbApi.collections.user, query).then((result) => {
        if (result.length > 0) {
            let queue = result[0].queue
            let item = queue.shift()
            queue.push(item)
            update = {
                userId: userId,
                queue: queue
            }
            dbApi.update(dbApi.collections.user, update).then((result) => {
                settings.DEBUG && console.log("Queue Reformed")
            }).catch((err) => {
                reject(err)
            })
        }
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
}

/**
 * Remove all questions from user queue that have already been answered.
 * @param {*} query 
 * 
 */
const updateQuestionQueue = (query) => {
    return new Promise((resolve, reject) => {
        dbApi.find(dbApi.collections.user, query).then((result) => {
            if (result.length == 0) {resolve([])}
	    let queue = result[0].queue
            let questionIds = queue.map(item => item.questionId)
            let newQuery = {
                questionId: { $in: questionIds}
            }
            settings.DEBUG && console.log("Updat question query: ", newQuery)
            dbApi.find(dbApi.collections.question, newQuery).then((qResult) => {
                settings.DEBUG && console.log("Questions found: ", qResult)
                let activeQuestions = qResult.filter(item => !item.isAnswered)
                let activeQuestionIds = activeQuestions.map(item => item.questionId)
                settings.DEBUG && console.log("activeQuestions: ", activeQuestions)
                settings.DEBUG && console.log("Old queue: ", queue)
                let updatedQueue = queue.filter(old => activeQuestionIds.includes(old.questionId))
                settings.DEBUG && console.log("updatedQueue: ", updatedQueue)
                let update = {
                    userId: query.userId,
                    queue: updatedQueue,
                }
                dbApi.update(dbApi.collections.user, update).then((result) => {
                    resolve(updatedQueue)
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => {
                reject(err)
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * Set user status to offline. 
 * 
 * We use the isOnline flag when searching for smes. isOnline is set to false
 * whenever the user runs the app in the background or has exited the app. 
 * Matching op with an sme is only possible if the sme has the app open as 
 * well. This is the nature of Simi (and in a way the value proposition, which
 * is that we promise to match op with someone right away for a real-time
 * conversation. This is only possible if both users are currently using the 
 * app). 
 * 
 * @param {*} userId 
 */
const userIsOffline = (userId) => {
    let data = {
        userId: userId,
        isOnline: false,
    }
    dbApi.update(dbApi.collections.user, data).then((result) => {
        settings.DEBUG && console.log("Cleanup: ", result)
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
    activityLog(userId)
}



/**
 * Delete any question(s) submitted by op that haven't been answered yet.
 * The consequence of not doing this is that two smes may end up joining
 * a chatroom on a question neither one of them asked.
 * 
 * NB: We don't have a corresponding cleanup operation for sme because if 
 * a user is in sme mode, they don't have any pending questions. However,
 * they do have a queue of questions. The queues don't need to be cleanued up
 * because that operation is taken care of by the swipedeck endpoint. The
 * swipedeck endpoint performs "garbage" collection even while the sme is using
 * the app. 
 * @param {*} userId 
 */
const cancelQuestion = (questionId) => {
    let query = {
        questionId: questionId,
        isAnswered: false,
    }
    dbApi.delete(dbApi.collections.question, query).then((result) => {
        settings.DEBUG && console.log("Question cleanup: ", result)
        query = {
            roomId: questionId
        }
        dbApi.delete(dbApi.collections.chatRoom, query).then((cResult) => {
            settings.DEBUG && console.log("ChatRoom cleanup: ", cResult)
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })

    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
}


/**
 * Perform server-side cleanup operations.
 * @param {*} socket 
 */
const cleanup = (data, updateUserStatus=false) => {
    if (updateUserStatus) { userIsOffline(data.userId) } 
    cancelQuestion(data.questionId)
}

module.exports = {
    updateQueue: updateQuestionQueue,
    reformQueue: reformQueue,
    activityLog: activityLog,
    cleanup: cleanup
}
