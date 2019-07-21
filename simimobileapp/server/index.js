const api = require("./src/api/api")
const dbApi = require("./src/utils/db")
const helpers = require("./src/utils/helpers")
const socketEvents = require("./src/chat/events")
const endpoints = require("./src/api/endpoints")
const bodyParser = require('body-parser')
const settings = require("./settings")
const cors = require("cors")
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 5001

app.use(cors())
app.use( bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const HEADER_TYPE = 'Content-Type'
const MIME_TYPE = 'application/json'
const USER_ID = 'userId'
const LAST_MODIFIED = "lastModified"
const CREATED = "created"
const QUEUE = "queue"

// Command to start the server from the shell
// npm run dev

/*
    Login a user. If the user already exists, update the record.
    Otherwise, create a new one. Return the resulting user id.
*/
app.post(endpoints.REST.login, (req, res) => {
    res.setHeader(HEADER_TYPE, MIME_TYPE)
    let userId = dbApi.USER_ID_PREFIX + api.uuid()
    let userData = req.body
    let obj = {}
    query = {
        facebookId: userData.facebookId,
        email: userData.email,
    }
    dbApi.find(dbApi.collections.user, query).then((fResult) => {
        if (fResult.length == 0) {
            // Create a new user and assign a new userId.
            // Why are we using a uuid instead of the Facebook ID? 
            // We want our id assignment to be uniform across the entire 
            // project and have predictable prefixes for potential filter 
            // operations  
            userData[USER_ID] = userId
            userData[LAST_MODIFIED] = new Date()
            userData[CREATED] = new Date()
            userData[QUEUE] = []
            userData.isNewUser = true
	   userData.role = "user"
            dbApi.insert(dbApi.collections.user, userData).then((iResult) => {
                obj[USER_ID] = userId
                res.send(JSON.stringify(obj))
            }).catch((err) => {
                obj[USER_ID] = null
                res.send(JSON.stringify(obj))
            })
        } else {
            // update user data
            delete userData.lastModified
            dbApi.update(dbApi.collections.user, userData).then((result) => {
                if (result.length > 0) {
                    obj[USER_ID] = result[0].userId
                    res.send(JSON.stringify(obj))
                } else {
                    // This block should never execute because the user does exist 
                    // If this does execute, then something funky is going on.
                    obj[USER_ID] = null
                    res.send(JSON.stringify(obj))
                }
            })  
        }
    }).catch((err) => {
        obj[USER_ID] = null
        res.send(JSON.stringify(obj))
    })
})

/**
 * Update user fields
 */
app.post(endpoints.REST.user, (req, res) => {
    if (req.body.isOnline) { 
        helpers.activityLog(req.body.userId, cleanup=true)
        helpers.activityLog(req.body.userId) 
    }
    let query = req.body
    query.role = "user"
    let msg = {Status: "OK"}
    dbApi.update(dbApi.collections.user, query).then((result) => {
        settings.DEBUG && console.log("User update: ", result)
        res.send(JSON.stringify(msg))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
        msg.Status = "FAIL"
        res.send(JSON.stringify(msg))
    })
})

/**
 * Get a count of number of users currently online. 
 * If we encounter some sort of error while querying the database,
 * just set the number of users to be -1.
 */
app.get(endpoints.REST.user, (req, res) => {
    let query = {
        isOnline: true,
	role: "user",
    }
    let response = {count: -1}
    dbApi.find(dbApi.collections.user, query).then((result) => {
        settings.DEBUG && console.log("Number of users online: ", result.length)
	settings.DEBUG && console.log("Users found: ", result)
        response.count = result.length
        res.send(JSON.stringify(response))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
        res.send(JSON.stringify(response))
    })
})

/**
 * Update the queue
 */
app.post(endpoints.REST.reformQueue, (req, res) => {
    helpers.reformQueue(req.body.userId)
    let msg = {Status: "OK"}
    res.send(JSON.stringify(msg))
})

/*
    Save newly submitted question to the database and populate 
    boolean fields. Then call the match api to match the question
    to SMEs and start pushing it onto their queues.
 */
app.post(endpoints.REST.question, (req, res) => {
    let questionId = dbApi.QUESTION_ID_PREFIX + api.uuid()
    data = {
        questionId:     questionId,
        userId:         req.body.userId,
        question:       req.body.question,
        lastModified:   new Date(),
        created:        new Date(),
        isAnswered:     false,
    }
    settings.DEBUG && console.log("New question received: ", data)
    dbApi.insert(dbApi.collections.question, data).then((__result) => {
        api.findSmes({
            question: data.question,
            questionId: data.questionId,
            op: data.userId
        }).then((result) => {
            settings.DEBUG && console.log("Smes Found: ", result)
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        }) 
        res.send(JSON.stringify({questionId: questionId}))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
        res.send(JSON.stringify({questionId: null}))
    })  
})

app.delete(endpoints.REST.question, (req, res) => {
    let response = {message: "Cleanup request submitted"}
    helpers.cleanup(req.body)
    res.send(JSON.stringify(response))
})

app.get(endpoints.REST.knowledgeBase, (req, res) => {
    let query = {
        userId: req.query.userId
    }
    dbApi.find(dbApi.collections.knowledgebase, query).then((fResult) => {
        res.send(JSON.stringify({topics: fResult}))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
})

app.delete(endpoints.REST.knowledgeBase, (req, res) => {
    let query = req.body
    dbApi.delete(dbApi.collections.knowledgebase, query).then((result) => {
        res.send(JSON.stringify(result))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
})

/**
 * Add or remove a topic from user's knowledge base. If no topic 
 * is provided, return a list of all the topics in the knowledge
 * base. A topic has the following format:
 */
app.post(endpoints.REST.knowledgeBase, (req, res) => {
    let topicId = dbApi.KB_ID_PREFIX + api.uuid()
    let data = {
        userId: req.body.userId,
        topic: req.body.topic,
        topicId: topicId,
        lastModified: new Date(),
        created: new Date(),
        clustered: false,
    }
    dbApi.insert(dbApi.collections.knowledgebase, data).then((result) => {
        res.send(JSON.stringify(data))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })  
})

/**
 * Return all items not marked for deletion.
 */
app.get(endpoints.REST.inbox, (req, res) => {
    let query = { userId: req.query.userId }
    dbApi.find(dbApi.collections.inbox, query).then((result) => {
        res.send(JSON.stringify({data: result}))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
})

/**
 * Update the isRead state of inbox messages.
 */
app.post(endpoints.REST.inbox, (req, res) => {
    dbApi.update(dbApi.collections.inbox, req.body).then((result) => {
            res.send(JSON.stringify(result))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
})

/**
 * Delete inbox messages. 
 * 
 * NB: We should not delete the corresponding chat messages because
 * both the sme and op use the same chat record from db. 
 */
app.delete(endpoints.REST.inbox, (req, res) => {
    let inboxQuery = {
        _id: { $in: dbApi.castIds(req.body.toDelete) }
    }
    dbApi.find(dbApi.collections.inbox, inboxQuery).then((result) => {
      
        dbApi.delete(dbApi.collections.inbox, inboxQuery, many=true).then((result) => {
            res.send(JSON.stringify(result))
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })

    
})

app.get(endpoints.REST.chatLog, (req, res) => {
    let query = req.query
    delete query.userId
    dbApi.find(dbApi.collections.chat, query).then((result) => {
        res.send(JSON.stringify(result))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
})

/**
 * Return all the questions in the user's queue
 * TODO: the queue in the question object needs to be a hashset
 * so we can filter by userId
 */
app.get(endpoints.REST.swipeDeck, (req, res) => {
    let query = {
        userId: req.query.userId
    }
    helpers.updateQueue(query).then((queue) => {
        settings.DEBUG && console.log("Queue: ", queue.length)
        res.send(JSON.stringify({queue: queue}))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })
})

/**
 * Return the existing data and user information for populating
 * the app after the user has logged in. Include server endpoints
 * and available socket events.
 */
app.get(endpoints.REST.download, (req, res) => {
    settings.DEBUG && console.log("Download requested on userId: ", req.query.userId)
    let query = { userId: req.query.userId }
    dbApi.find(dbApi.collections.inbox, query).then((inboxRes) => {
        dbApi.find(dbApi.collections.knowledgebase, query).then((kbRes) => {
            dbApi.find(dbApi.collections.user, query).then((userRes) => {
		settings.DEBUG && console.log("User result found for download: ", userRes)
                res.send(JSON.stringify({
                    knowledgeBaseData: kbRes,
                    inboxData: inboxRes,
                    isNewUser: userRes.length > 0 ? userRes[0].isNewUser : true,
                    events: endpoints.socket,
                    endpoints: endpoints.REST
                }))
            }).catch((err) => {
                settings.DEBUG && console.log(err)
            })
        }).catch((err) => {
            settings.DEBUG && console.log(err)
        })
    }).catch((err) => {
        settings.DEBUG && console.log(err)
    })

})

/**
 * Check if the current question has alredy been answered. If so,
 * deny join. Otherwise, allow it.
 */
app.get(endpoints.REST.rightSwipe, (req, res) => {
    let canJoin = false
    dbApi.find(dbApi.collections.question, req.body).then((result) => {
        if (result.length > 0 && !result[0].isAnswered) { canJoin = true }
        res.send(JSON.stringify({canJoin: canJoin}))
    }).catch((err) => {
        settings.DEBUG && console.log(err)
        res.send(JSON.stringify({canJoin: canJoin}))
    })
})

app.post(endpoints.REST.cleanup, (req, res) => {
    let response = {message: "Cleanup request submitted"}
    helpers.cleanup(req.body, updateUserStatus=true)
    res.send(JSON.stringify(response))
})

/**
 * Listen for an incoming socket connection and register 
 * event handlers.
 */
io.on(endpoints.socket.connection, socketEvents.eventHandler) 

http.listen(port, () => settings.DEBUG && console.log(`Listening on port ${port}`));
