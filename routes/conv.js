var auth = require('../auth');
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var db = require('node-mysql');
var sqldb = require('mysql');

var router = express.Router();
var jsonParser = bodyParser.json();
var conversation = watson.conversation(auth.watson.conversation);

var featureCollection = [];

var connection = sqldb.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",

  // Your password
  password: "sagat99",
  database: "bitbot"
});

// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("connected as id " + connection.threadId);

//   //Get your entire collection
//   afterConnection();

// });

function afterConnection() {
  connection.query("SELECT * FROM features", function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {      
      featureCollection.push(res[i]);
    }


  });

}

if(featureCollection.length > 0)
{


}


router.post('/', jsonParser, function(req, res,next)
{

console.log(auth.watson.conversation.workspace_id);
conversation.message({
'input' : req.body.input,
'context' : req.body.context,
'workspace_id': auth.watson.conversation.workspace_id
},
function(err, response)
{
if(err)
{
console.log('error:',err);
}
else
{
//console.log(JSON.stringify(response,null,2));
res.json(response);
}
});
});

module.exports = router;






