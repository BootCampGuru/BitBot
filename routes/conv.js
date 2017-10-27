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
  password: "sagat99",
  database: "bitbot"
});

function newStudentLookup(id) {
  connection.query("select conversation_id FROM new_student where ?",
    [
      {
        conversation_id: id
      }
    ], function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {      
      featureCollection.push(res[i]);
    }

    if(featureCollection.length > 0)
    {

    }
    else
    {

    }


  });

}

function insertNewStudent(conversationid)
{

  var query = connection.query(
    "INSERT INTO new_student SET ?",
    { 
      conversation_id: conversationid

    },
    
    function(err, res) {
      console.log(res.affectedRows + " new student inserted!\n");
    }
  );
 
}

router.post('/', jsonParser, function(req, res,next)
{

  if(req.body.input.text == "")
    return;

console.log(JSON.stringify(req.body.input.text));

if(req.body.input.text === "new student" || req.body.input.text === "newstudent")
{

insertNewStudent(req.body.context.conversation_id);

}

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






