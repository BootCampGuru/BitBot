var auth = require('../auth');
var dbConnections = require('./db');
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var db = require('node-mysql');
var sqldb = require('mysql');
var http = require('http');
var router = express.Router();
var jsonParser = bodyParser.json();
var request = require("request");
var conversation = watson.conversation(auth.watson.conversation);
var q = require('q');

var studentCollection = [];

router.get('/', function(req, res, next) {

var deferred = q.defer(); 

dbConnections.connect(function(err) {
 if (err) throw err;
  
 dbConnections.query("SELECT * FROM new_student", function(err, rest) {
    if (err) throw err;

    for (var i = 0; i < rest.length; i++) {   
    var data = {student : rest[i]}   
     
      studentCollection.push(data);
    }

       obj = {studentCollection: rest};
        res.render('getnewstudents', obj);  
        dbConnections.end();
   
   
  });
    });

    
});

module.exports = router;


