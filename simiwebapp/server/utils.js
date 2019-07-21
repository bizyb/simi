const DEBUG = false
const dbApi = require("./db");
/**
 * Create a new staff user if one doesn't already exist
 */
const addNewUser = () => {
    dbApi.find(dbApi.collections.user, {}).then((result) => {
        if (result.length == 0) {
          let newUser = {
              firstName: "Biz",
              lastName: "Melesse",
              username: "bmelesse",
              password: "IDfc6FQ_F",
              role: "staff",
          }
          dbApi.insert(dbApi.collections.user, newUser).then((result) => {
            DEBUG && console.log("New user data: ", newUser)  
            DEBUG && console.log("New user inserted: ", result)
          }).catch(err => {
                DEBUG && console.log(error)
            })
        }
    }).catch(err => {
        DEBUG && console.log(error)
    })
}

module.exports = {
    DEBUG: DEBUG,
    addNewUser: addNewUser,
}