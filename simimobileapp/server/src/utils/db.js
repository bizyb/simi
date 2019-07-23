const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb')
const DB_NAME = "simi"
// const URL = "mongodb://localhost:27017/simi"
const URL = "mongodb://mongodb:27017/simi"
const collections = {
    user:           "user",
    question:       "question",
    knowledgebase:  "knowledgebase",
    inbox:          "inbox",
    chat:           "chat",
    chatRoom:       "chatRoom",
    feedback:       "feedback",
    activityLog:    "activityLog",
}
const messageType = {
    chat: "chat",
    info: "info",
}

/**
 * Insert document into a named collection. If the
 * collection doesn't exist, create one automatically.
 * Call the callback function once done to close the 
 * connection.
 * 
 * Data formats by collection type
 *  user: {
 *          created: Date,
 *          lastModified: Date,
 *          isNewUser: boolean,
 *          facebookId: string,
 *          picture: string,
 *          email: string,
 *          last_name: string,
 *          first_name: string,
 *          userId: string,
 *          isOnline: false,
 *          queue: [],
 *      }
 *  activityLog: {
 *          userId: string,
 *          start: Date,
 *          end: Date,
 *          locked: boolean
 *      }
 * 
 * question:
 *        {
 *          created: Date,
 *          lastModified: Date,
 *          questionId:  string,
 *          userId: string,
 *          question: string,
 *          isAnswered: boolean,
 *       }
 * 
 * 
 *  chat:
 *        {
 *          created: Date,  
 *          fromId: string,
 *          toId: string,
 *          message: string,
 *          question: string,
 *          chatId: string,
 *        }
 * 
 *  chatRoom:
 *          {
 *              created: Date,
 *              lastModified: Date,
 *              roomId: string,
 *              op: {
 *                  userId: string,
 *                  socketId: string,
 *                  name: string,
 *              },
 *              sme: {
 *                  userId: string,
 *                  socketId: string,
 *                  name: string,
 *              }
 *              chatId: string,
 *              question: string,
 *          }
 * 
 *  inbox:
 *       {
 *          created: Date,
 *          lastModified: Date,
 *          messageType: string,
 *          heading: string,
 *          subheading: string,
 *          isRead: boolean,
 *          url: string,
 *          userId: string,
 *          questionId: string,
 *      }
 * 
 *  knowledgebase:
 *      {
 *          created: Date,         
 *          topic: string,
 *          topicId: string,
 *          userId: string,
 *          clustered: boolean,
 *      }
 *  
 *  feedback:
 *      {
 *          created: Date,
 *          opId: string,
 *          smeId: string,
 *          questionId: string,
 *          chatId: string,
 *          rating: integer,
 *  }
 * 
 * @param {*} collectionName 
 * @param {*} data 
 */
const insert = (collectionName, data) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(URL, { useNewUrlParser: true }).then((db) => {
            client = db.db(DB_NAME).collection(collectionName)
            client.insertOne(data).then((result) => {
                db.close()
                resolve(result.result) 
            }).catch((err) => {
                db.close()
                reject(err)
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * Cast string ids to ObjecId data type
 * @param {*} ids an array of ids  
 */
const castIds = (ids) => {
    return ids.map(item => mongo.ObjectId(item))
}

const deleteDocument = (collectionName, data, many=false) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(URL, { useNewUrlParser: true }).then((db) => {
            client = db.db(DB_NAME).collection(collectionName)
            if (many) {
                client.deleteMany(data).then((result)=> {
                    db.close()
                    resolve(result.result)
                }).catch((err) => {
                    db.close()
                    reject(err)
                })

            } else {
                client.deleteOne(data).then((result) => {
                    db.close()
                    resolve(result.result) 
                }).catch((err) => {
                    db.close()
                    reject(err)
                })
            }
        }).catch((err) => {
            reject(err)
        })
    })
    
}

/**
 * Run the find function on the collection and return a Promise so the
 * caller can wait on the result. Note that MongoClient also returns 
 * a promise if a callback is not provided. There's no way to get the 
 * result out to the caller otherwise.
 * 
 * @param {*} collectionName 
 * @param {*} query 
 */
const find = (collectionName, query) => {
        return new Promise((resolve, reject) => {
        MongoClient.connect(URL, { useNewUrlParser: true }).then((db) => {
            client = db.db(DB_NAME).collection(collectionName)
            client.find(query).sort({created: -1}).toArray().then((result) => {
                db.close()
                resolve(result)
            }).catch((err) => {
                db.close()
                reject(err)
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

const update = (collectionName, data) => {
    return new Promise((resolve, reject) => {
    MongoClient.connect(URL, { useNewUrlParser: true }).then((db) => {
        client = db.db(DB_NAME).collection(collectionName)
        let query = {}
        if (collectionName == collections.user && data.userId == null) {
            query = {
                email: data.email,
            }   
        } else if (collectionName == collections.user) {
            query = {
                userId: data.userId
            }   
        }else if (collectionName == collections.question) {
            query = {
                questionId: data.questionId
            }
        } else if (collectionName == collections.inbox || 
                collectionName == collections.activityLog) {
            query = {
                userId: data.userId,
                _id: mongo.ObjectId(data._id),
            }
            delete data.userId
            delete data._id
        }  else if (collectionName == collections.chatRoom) {
            query = {
                roomId: data.roomId,
            }
        }
        client.updateOne(
            query,
            {
                $set: data,
                $currentDate: { lastModified: true }
            }
        ).then((result) => {
            db.close()
            find(collectionName, query).then((fResult) => {
                resolve(fResult)
            }).catch((err) => {
                reject(err)
            })
        }).catch((err) => {
            db.close()
            reject(err)
        })
             
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports = {

    USER_ID_PREFIX:     "usm",
    QUESTION_ID_PREFIX: "qsm",
    KB_ID_PREFIX:       "ksm",   
    collections:        collections, 
    insert:             insert,
    delete:             deleteDocument,
    find:               find,
    update:             update,
    messageType:        messageType,
    castIds:            castIds
}
