const dbApi = require("../utils/db")
const api = require("../api/api")
const endpoints = require("../api/endpoints")
const settings = require("../../settings")


/**
 * Update the question status so that future smes won't be able to 
 * answer a stale question.
 * @param {*} data 
 * 
 */
const updateQuestionStatus = (questionId) => {
    let query = {
        questionId: questionId,
        isAnswered: true,
    }
    dbApi.update(dbApi.collections.question, query).then((result) => {
        settings.DEBUG && console.log(result)
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })

}


/**
 * If no chat room with roomId exists, create a new one and add 
 * the first user to the room. Assume the user to be op. However,
 * if update is requested, assume the room already exists and the 
 * user is sme. Add them to the room and update the corresponding 
 * chat room meta data. After updating, let op know (by broadcasting) 
 * that an sme has been found and send sme profile information. Do 
 * the same for sme but with op profile information.
 * 
 * Also, do some sanity check to prevent more than two users from joining
 * the same chat room. There's still a bug--if two or more smes try to join
 * at the same time to the millisecond--but the odds of that happening are
 * pretty low, i.e. odds of getting canJoin confirmation at the same time * 
 * odds of calling join at the same time * odds of db operations taking place
 * at the same interval during the canJoin and join calls.  
 * 
 * @param {string}  roomId  chat room identifier
 * @param {Object}  data    user information
 * @param {Socket}  socket  requesting user's socket object
 * @param {boolean} update  whether or not to update the chat room meta data
 */
const _onJoinHelper = (roomId, data, socket, questionId, update=false) => {
    socket.join(roomId, () => {
        if (update) {
            if (data.numUsers == 2) { 
                return
            }
            data.numUsers = 2
            dbApi.update(dbApi.collections.chatRoom, data).then((result) => {
                // the chat room fields are now fully populated so locate the 
                // op and sme user information
                settings.DEBUG && console.log("onJoinHelper after updating: ", result)
                let query = { roomId: data.roomId }
                dbApi.find(dbApi.collections.chatRoom, query).then((crResult) => {
                    query = { userId: crResult[0].op.userId }
                    dbApi.find(dbApi.collections.user, query).then((opResult) => {
                        query = { userId: crResult[0].sme.userId }
                        dbApi.find(dbApi.collections.user, query).then((smeResult) => {
                            let opProfile = {}
                            let smeProfile = {}
                            if (smeResult.length > 0) {
                                smeProfile = {
                                    name:    smeResult[0].first_name,
                                    picture: smeResult[0].picture,
                                    userId:     smeResult[0].userId,
                                }
                            }
                            if (opResult.length > 0) {
                                opProfile = {
                                    name:    opResult[0].first_name,
                                    picture: opResult[0].picture,
                                    userId:     opResult[0].userId,
                                }
                            }
                            // send smeProfile to op and vice versa
                            // nb: the current user socket belongs to sme
                            updateQuestionStatus(questionId)
                            socket.broadcast.emit(endpoints.socket.smeFound, smeProfile) // sent to op
                            socket.emit(endpoints.socket.opFound, opProfile) // sent to sme

                        }).catch((err) => {
                        settings.DEBUG && console.log(err)
                        })
                    }).catch((err) => {
                    settings.DEBUG && console.log(err)
                    })
                }).catch((err) => {
                settings.DEBUG && console.log(err)
                })
            }).catch((err) => {
                settings.DEBUG && console.log(err)
            })
        } else {
            dbApi.insert(dbApi.collections.chatRoom, data).then((result) => {
                settings.DEBUG && console.log(result)
            }).catch((err) => {
                settings.DEBUG && console.log(err)
            })
        }  
    })
}

/**
 * Add user to a chat room identified by roomId. Ensure that there
 * are exactly two users in a chat room at any given time, one of 
 * whom is the op and the other the sme. The first user added to 
 * a chat room is always the op because the question doesn't get 
 * published until after the chat room has been created. 
 * 
 * If op is already in the waiting room when the sme joins, create 
 * a new chat session and pass the chat id along with the sme id 
 * for updating the chat room record.
 * 
 * 
 * @param {Object} data     user information
 * @param {Socket} socket   requesting user's socket object
 */
const onJoin = (data, socket) => {
    let questionId = data.questionId
    let query = { roomId: data.roomId }
    settings.DEBUG && console.log("Attempting to join with data: ", data)
    dbApi.find(dbApi.collections.chatRoom, query).then((result) => {
        if (result.length == 0) {
            // create a new chat room record 
            let metaData = {
                lastModified: new Date(),
                created: new Date(),
                roomId: data.roomId,
                op: {
                    userId: data.userId,
                    firstName: data.firstName,
                    socketId: socket.id,
                },
                sme: {},
                question: data.question,
                questionId: data.questionId,
                numUsers: 1,
            }
	    settings.DEBUG && ("No room found so creating a new room with data: ", metaData)	
            _onJoinHelper(data.roomId, metaData, socket, questionId, update=false)
        }
        else {
            updateData = {
                roomId: data.roomId,
                sme: {
                    userId: data.userId,
                    firstName: data.firstName,
                    socketId: socket.id,
                },
            }
            // Some sanity check... make sure op and sme are not
            // the same person
            if (result[0].op.userId != updateData.sme.userId) {
                _onJoinHelper(data.roomId, updateData, socket, questionId, update=true)
            }
            
        }
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })  
}


/**
 * Broker op and sme chat messages by forwarding between the 
 * two users. At the same time, save the transaction to the 
 * database. 
 * 
 * There are two types of messages: a preamble and a chat message.
 * A preamble only consists of the question and questionId and must
 * not be broadcasted. A chat message consists of all the fields, 
 * except the question and should be broadcasted.
 * 
 * @param {Object} data Chat message
 * @param {Socket} socket Sender socket object
 */
const onMessage = (data, socket) => {
    let log = {
        created: new Date(),
        fromId: data.fromId,
        toId: data.toId,
        message: data.message,
        question: data.question,
        questionId: data.questionId,
        key: data.key,
    }
    if (!data.isPreamble) {
        socket.broadcast.emit(endpoints.socket.message, log)
    }
    dbApi.insert(dbApi.collections.chat, log).then((result) => {
        settings.DEBUG && console.log(result)
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })

    
}


/**
 * Let the other user know that their partner is typing or not.
 * @param {*} data 
 * @param {*} socket 
 */
const onIsTyping = (data, socket) => {
    socket.broadcast.emit(endpoints.socket.isTyping, data)
}

/**
 * Save user feedback.
 * 
 * @param {*} data 
 * @param {*} socket 
 */
const onFeedback = (data, socket) => {
    data["created"] = new Date()
    dbApi.insert(dbApi.collections.feedback, data).then((result) => {
        settings.DEBUG && console.log("Feedback: ", result)
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
}
/**
 * Construct an inbox item object and push the result to op's inbox 
 * if isOp is true. Otherwise, push to sme's inbox.
 * 
 * @param {string} roomId 
 */
const pushToInbox = (roomId, isOp=false) => {
        let query = {
            roomId: roomId
        }
        dbApi.find(dbApi.collections.chatRoom, query).then((crResult) => {
            // some sanity check to see if the chat room exists
            if (crResult.length > 0) {
                query = {
                    questionId: crResult[0].roomId
                }
                dbApi.find(dbApi.collections.chat, query).then((cResult) => {
                    // proceed if we have actual chat content, not just the preamble. The preamble
                    // is the first item in the chat.
                    if (cResult.length > 1) {
                        let userId = ""
                        let heading = ""
                        let subheading = ""
                        if (isOp) {
                            userId = crResult[0].op.userId
                            heading = crResult[0].op.firstName
                        } else { 
                            userId = crResult[0].sme.userId
                            heading = crResult[0].sme.firstName
                        }
                        subheading = crResult[0].question
                        let inboxItem = {
                            created: new Date(),
                            lastModified: new Date(),
                            messageType: dbApi.messageType.chat,
                            heading: heading,
                            subheading: subheading,
                            isRead: false,
                            url: null,
                            userId: userId,
                            questionId: crResult[0].roomId
                        }
                        dbApi.insert(dbApi.collections.inbox, inboxItem).then((iResult) => {
                            settings.DEBUG && console.log(iResult)
                        }).catch((err) => {
                            settings.DEBUG && console.log(err)
                        })
                }
                }).catch((err) => {
                    settings.DEBUG && console.log(err)
                })   
            }
        }).catch((err)=> {
            settings.DEBUG && console.log(err)
        })
}

/**
 * Disconnect the user from their current (and only, except for the default)
 * chat room. After disconnecting, let their chat partner know that they have
 * disconnected. Also, push the chat log to their inbox.
 * 
 * @param {*} data 
 * @param {*} socket 
 */

const onLeave = (data, socket) => {
    // push chat log to the inbox
    pushToInbox(data.roomId, data.isOp)
    let query = { roomId: data.roomId }
    dbApi.find(dbApi.collections.chatRoom, query).then((fResult) => {
        if (fResult.length > 0) {
            let numUsers = fResult[0].numUsers
            socket.leave(data.roomId, () => {
                numUsers -= 1
                if (numUsers > 0) {
                    query = {
                        roomId: data.roomId,
                        numUsers: numUsers
                    }
                    dbApi.update(dbApi.collections.chatRoom, query).then((uResult) => {
                        settings.DEBUG && console.log("Chat room updated: ", uResult)
                        socket.broadcast.emit(endpoints.socket.alert, endpoints.socket.alerts.leave)
                    }).catch((err) => {
                        settings.DEBUG && console.log(err)
                    })
                } else {
                    dbApi.delete(dbApi.collections.chatRoom, query).then((dResult) => {
                        settings.DEBUG && console.log("Chat room deleted: ", dResult)
                    }).catch((err) => {
                        settings.DEBUG && console.log(err)
                    })
                }  
            })
        } else { settings.DEBUG && console.log("Chat room does not exist")}
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })   
}


const eventHandler = (socket) => {
    settings.DEBUG && console.log("Setting socket.io event handlers")   
    /**
     * Assign this socket the user id this socket belongs to.
     * Later, userId is used in cleanup on disconnect.
     */
    socket.on(endpoints.socket.onUserId, (data) => {
            settings.DEBUG("User Id set for socket with id: ", socket.id)
	    socket["userId"] = data.userId
    })
    socket.on(endpoints.socket.join, (data) => {
	    settings.DEBUG("onJoin listener set")
        onJoin(data, socket)  
    })

    socket.on(endpoints.socket.leave, (data) => {
        onLeave(data, socket)
    })

    socket.on(endpoints.socket.message, (data) => {
        onMessage(data, socket)   
    })

    socket.on(endpoints.socket.isTyping, (data) => {
        onIsTyping(data, socket)
    })

    socket.on(endpoints.socket.feedback, (data) => {
        onFeedback(data, socket)
    })

    socket.on(endpoints.socket.onSwipeDeck, (data) => {
        onSwipeDeck(data, socket)
    })

    // A disconnect event is called automatically if the user exits
    // the app. The socket is destroyed once this event gets called.
    socket.on(endpoints.socket.disconnect, () => {
        // pass
    })
}

module.exports = {
    eventHandler: eventHandler,
}
