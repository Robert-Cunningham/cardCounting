const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')

import bcrypt from 'bcrypt'
import session from 'express-session'

const bcryptSaltRounds = 10

let app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(session({
    secret: "aslkdfjalskjtjhtkjdsfgkdjjgblnloqiorjqjrpqofgjogu9898759843ytuhgdjdfgkjdfkaxlmcj",
    resave: false,
    saveUninitialized: false,
    name: 'session'
}))

let db;

MongoClient.connect("mongodb://localhost:27017", (err, client) => {
    if (err) {
        console.log(err)
    } else {
        db = client.db("dank")
        app.listen(80, () => {
            console.log("Listening on 80.")
        })
    }
})

app.get("/leaderboardData", (req, res) => {
    db.collection('scores')
//    .find({"name": { "$exists": true }, "correct": true })
//    .aggregate([{"$group": {_id: "$name", "name": "$name", "score": {"$min": "$score"}}}])
    .aggregate([{"$match": {"correct": true, "name": {"$exists": true} }}, {"$group": {_id: "$name", "score": {"$min": "$score"}}}])
//    project({"score": 1, "name": 1, "_id": 0})
//    .sort({"score": 1})
    .limit(5)
    .toArray((err, items) => {res.send(items)})
})

app.get("/fake", (req, res) => {
    res.send('[{"name": "robert", "score": 100}, {"name": "mr.poles", "score": 1000}]')
})

let countingVal = 0;

function createNewAccount(username, password, callback) {

    bcrypt.hash(password, bcryptSaltRounds, (err, hash) => {
        if (err) {
            console.log(err)
            return
        }
        console.log("User account created:", username, hash)
        db.collection('identity').save({id: username, hash: hash})
        callback()
    })
}

app.post("/newAccount", (req, res) => {

    db.collection('identity').findOne({id: req.body.username}, (e, o) => {
        if (o) {
            res.send({error: true, message: "Account already exists."})
        } else {
            createNewAccount(req.body.username, req.body.password, () => {
                res.send({error: false})
            })
        }
    })
})


app.post("/auth", (req, res) => {
    console.log("looking for " + req.body.username + " and " + req.body.password)
    db.collection('identity').findOne({id: req.body.username}, (e, o) => {
        if (o) {
            bcrypt.compare(req.body.password, o.hash, (err, correct) => {
                res.send({correct: correct})
            })
        } 
    })
})

app.post("/newScore", (req, res) => {
    console.log(req.body)
    db.collection('scores').save(req.body, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(JSON.stringify(req.body) + " saved to database.")
        }
        res.end();
    })
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html")
})

app.use(express.static(__dirname + "/client/build/"))