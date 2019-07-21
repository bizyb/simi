const cors = require("cors")
const express = require('express')
const bodyParser = require('body-parser')
const dbApi = require("./db");
const privacy = require("./assets/en/privacy.json")
const tos = require("./assets/en/tos.json")
const utils = require("./utils")

const app = express();
app.use(cors())
app.use( bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
    let response = { status: "FAIL" }
    utils.DEBUG && console.log("Login: ", req.body)
    dbApi.find(dbApi.collections.user, req.body).then((result) => {
      if (result.length > 0) {
        response.status = "OK"
      } 
      utils.addNewUser()
      res.send(JSON.stringify(response))
      }).catch((err) => {
          utils.DEBUG && console.log(err)
          res.send(JSON.stringify(response))
      })
  });

app.get('/endpoint', (req, res) => {
    // todo: check if logged in first
  let response = {endpoint: null}
  utils.DEBUG && console.log("Endpoint requested")
  dbApi.find(dbApi.collections.endpoint, {}).then((result) => {
    utils.DEBUG && console.log("Endpoint: ", result)  
    if (result.length > 0) {
          response.endpoint = result[0].endpoint
    }
    res.send(JSON.stringify(response))
    }).catch((err) => {
        utils.DEBUG && console.log(err)
        res.send(JSON.stringify(response))
    })
});

app.post('/endpoint', (req, res) => {
    // todo: check if logged in first
    let response = {status: "FAIL"}
    utils.DEBUG && console.log("Request: ", req.body)
    dbApi.update(dbApi.collections.endpoint, req.body).then((result) => {
        utils.DEBUG && console.log("Endpoint update: ", result)
        if (result.length > 0) {
            response.status = "OK"  
        }
        else {
            dbApi.insert(dbApi.collections.endpoint, req.body).then((result) => {
                utils.DEBUG && console.log("Endpoint Insert: ", result)
                response.status = "OK"
                res.send(JSON.stringify(response))
            }).catch((err) => {
                utils.DEBUG && console.log(err)
                res.send(JSON.stringify(response))
            })
        } 
        res.send(JSON.stringify(response))
    }).catch((err) => {
        utils.DEBUG && console.log(err)
        res.send(JSON.stringify(response))
    })
  });

app.get("/privacy", (req, res) => {
    utils.DEBUG && console.log("Privacy Policy requested")
    res.send(JSON.stringify(privacy))
})

app.get("/tos", (req, res) => {
    utils.DEBUG && console.log("Terms of Service requested")
    res.send(JSON.stringify(tos))
})

app.listen(5000, () => {
    utils.DEBUG &&  console.log('Listening on port 5000!')
});