var auth = require('../auth');
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var db = require('node-mysql');
var sqldb = require('mysql');
var wav = require('wav');
var Speaker = require('speaker');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

var router = express.Router();
var jsonParser = bodyParser.json();
var conversation = watson.conversation(auth.watson.conversation);

var featureCollection = [];

var SpeechToText = new SpeechToTextV1(
{
  username: 'ea666f48-2f84-4475-92f1-c24ff5c6322f',
  password: 'WJnTPL7L5TlG'
});


function transaction(feed)
{

 var connection = sqldb.createConnection({
  host: "rocklobster.cmglveqlnmr0.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "api_user",
  password: "ABC123",
  database: "codingBootcamp_db"
});

connection.connect(function(err) {
  if (err) throw err;

});

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
 
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

var MyDate = new Date();

  var created = new Date();
  var query = connection.query(
    "INSERT INTO feedback SET ?",
    {
      feedback: JSON.stringify(feed),
      create_date: MyDate.toMysqlFormat()
     
    },
    function(err, res) {
      connection.end();
      
    }
  );


}

router.get('/', function(req, res, next) {
   res.render('feedback', { title: 'Feedback Form' });
});


router.post('/', jsonParser, function(req, res,next)
{
transaction(req.body.input.text);
res.send("Feedback sent");
});

module.exports = router;


