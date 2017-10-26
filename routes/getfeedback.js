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

var featureCollection = [];

router.get('/', function(req, res, next) {
   res.render('getfeedback', { title: 'Feedbacks' });
});

router.post('/', function(req, res, next) {

var deferred = q.defer(); 

dbConnections.connect(function(err) {
  if (err) throw err;
  
 dbConnections.query("SELECT * FROM feedback", function(err, rest) {
    if (err) throw err;

    for (var i = 0; i < rest.length; i++) {   
    var data = {feedback : rest[i].feedback}   
     
      featureCollection.push(data);
    }
    
    console.log(featureCollection);``
    res.json(featureCollection);

    dbConnections.end();
   
  });
    });

    
});

module.exports = router;


