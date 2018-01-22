const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')

let app = express()

app.use(bodyParser.urlencoded({extended: true}))

var db;

MongoClient.connect("mongodb://localhost:27017", (err, database) => {
    if (err) {
        console.log(err)
    } else {
        db = database
        app.listen(80, () => {
            console.log("Listening on 80.")
        })
    }
})

app.get("/leaderboard", (req, res) => {
    res.send(db.collection('scores').find().toArray())
})

app.get("/fake", (req, res) => {
    res.send('{"robert": 1, "mr.poles": 2}')
})

app.post("/newScore", (req, res) => {
    db.collection('scores').save(req.body, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(req.body + " saved to database.")
        }
    })
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})

app.use(express.static(__dirname + "/client/build/"))
