var auth = require('../auth');
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var db = require('node-mysql');
var sqldb = require('mysql');
var router = express.Router();
var jsonParser = bodyParser.json();
var validator = require("email-validator");
var conversation = watson.conversation(auth.watson.conversation);


var connection = sqldb.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "sagat99",
  database: "bitbot"
});

function newStudentLookup(id, email) {

  var featureCollection = [];


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

      updateStudent(email,id);
    }


  });

}


function updateStudent(email,conversationid) {
  var query = connection.query(
    "UPDATE new_student SET ? WHERE ?",
    [
      {
        email: email
      },
      {
        conversation_id:conversationid
      }
    ],
    function(err, res) {
  
    }
  );

  // logs the actual query being run
  console.log(query.sql);
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

 var addLink = "";


  if(req.body.input.text == "")
    return;


console.log(JSON.stringify(req.body.input.text));

if(req.body.input.text === "new student" || req.body.input.text === "newstudent")
{

     insertNewStudent(req.body.context.conversation_id);

}

else

{

  if(req.body.input.text.toLowerCase() === "full stack web development" || req.body.input.text.includes("full stack web") || req.body.input.text.includes("full stack"))
  {
    addLink = " Get some information here - " + "<a href='https://bootcamp.cps.gwu.edu/coding/'>Full Stack Web Developer</a>" + " We will email information out shortly. Thank You for your interest.";
  }
 
  else if(req.body.input.text.toLowerCase() === "data visualizations" || req.body.input.text.includes("data visualization") || req.body.input.text.includes("visualization"))
  {
    addLink = " Get some information here - " + "<a href='https://bootcamp.cps.gwu.edu/data/'>Data Visualization</a>" + " We will email information out shortly. Thank you for your interest.";
  }
  else
  {
    addLink = "";
  }

  if(validator.validate(req.body.input.text))
  {
    //Add the email
    console.log("validation worked for email");
    newStudentLookup(req.body.context.conversation_id, req.body.input.text);
  }

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
console.log(JSON.stringify(response,null,2));
response.output.text = response.output.text + addLink;
res.json(response);
}
});
});

module.exports = router;






