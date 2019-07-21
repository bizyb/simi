const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb')
const DB_NAME = "simi"
const URL = "mongodb://mongodb:27017/simi"
const collections = {
    endpoint:   "endpoint",
    user:       "user",
}

/**
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
        if (collectionName == collections.endpoint ) {
            query = {}   
        } 
        client.updateOne(
            query,
            {
                $set: data,
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
   
    collections:        collections, 
    insert:             insert,
    delete:             deleteDocument,
    find:               find,
    update:             update,
    castIds:            castIds
}