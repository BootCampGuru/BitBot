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

var featureNames = [];

function featureName(featurename) {
   featureNames = []
  connection.query("select description, links FROM features where ?",
    [
      {
        feature_name: featurename
      }
    ], function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {      
      featureNames.push("<a href='" + res[i].links + "'>" + " Helpful Link </a>. Say Help if you would like to continue?");
    }
    
  });


}

 function allFeatures(name) {
   featureNames = []
  connection.query("select feature_name FROM features where ?",
    [
      {
        language_name: name
      }
    ], function(err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {      
      featureNames.push(res[i].feature_name);
    }
      
  });

}



function newStudentLookup(id, value, columnname) {

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

      updateStudent(value,columnname, id);
    }


  });

}


function updateStudent(value,columnname,conversationid) {
  console.log(columnname);
  console.log(value);
  var query = connection.query(
    "UPDATE new_student SET " + columnname + " = ? WHERE ?",
    [
         value,   

        {conversation_id:conversationid} 
    ],
    function(err, res) {
      
    }
  );

}

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
 
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


function insertNewStudent(conversationid)
{
  var MyDate = new Date();
  var query = connection.query(
    "INSERT INTO new_student SET ?",
    { 
      conversation_id: conversationid

    },
    
    function(err, res) {
      //console.log(res.affectedRows + " new student inserted!\n");
     updateStudent(MyDate.toMysqlFormat(),"create_date",conversationid);
    }
  );
 
}

router.post('/', jsonParser, function(req, res,next)
{

 var addLink = "";
 featureNames = [];

  if(req.body.input.text == "")
    return;

//console.log(JSON.stringify(req.body.input.text));

if(req.body.input.text === "new student" || req.body.input.text === "newstudent")
{

     insertNewStudent(req.body.context.conversation_id);

}

else

{

  if(req.body.input.text.toLowerCase() == "headings" || req.body.input.text.toLowerCase() == "variables" || req.body.input.text.toLowerCase() == "create" || req.body.input.text.toLowerCase() == "selectors" || req.body.input.text.toLowerCase() == "modules" || req.body.input.text.toLowerCase() == "margins" || req.body.input.text.toLowerCase() == "primary key")
  {
    featureName(req.body.input.text.toLowerCase());
  }  
  else if(req.body.input.text.toLowerCase() === "html" || req.body.input.text.toLowerCase() === "css" || req.body.input.text.toLowerCase() === "javascript" || req.body.input.text.toLowerCase() === "jquery" || req.body.input.text.toLowerCase() === "mongodb" || req.body.input.text.toLowerCase() === "mysql" || req.body.input.text.toLowerCase() === "nodejs" || req.body.input.text.toLowerCase() === "reactjs")
  {
    allFeatures(req.body.input.text.toLowerCase());

  }

  else if(req.body.input.text.toLowerCase() === "full stack web development" || req.body.input.text.includes("full stack web") || req.body.input.text.includes("full stack"))
  {
    addLink = " Get some information here - " + "<a href='https://bootcamp.cps.gwu.edu/coding/'>Full Stack Web Developer</a>";
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
    
    newStudentLookup(req.body.context.conversation_id, req.body.input.text,"email");
  }
  else if(req.body.input.text == "under 6 months" || req.body.input.text == "over 6 months"){
    //Add the time frame
    newStudentLookup(req.body.context.conversation_id, req.body.input.text, "time_frame");
  }
else if(req.body.input.text.includes("full stack") || req.body.input.text.includes("data visualization")){
    //Add the course
    newStudentLookup(req.body.context.conversation_id, req.body.input.text, "course");
  }

  else if(req.body.input.text.includes("yes") || req.body.input.text.includes("y") || req.body.input.text.includes("no")){
    //Add the programming experience
    newStudentLookup(req.body.context.conversation_id, req.body.input.text, "has_experience");
  }

   else if(req.body.input.text.toLowerCase() == "dc" || req.body.input.text.toLowerCase() == "arlington"  || req.body.input.text.includes("arlington") || req.body.input.text.includes("dc") || req.body.input.text.includes("district") || req.body.input.text.includes("capital")){
    //Add the location
    newStudentLookup(req.body.context.conversation_id, req.body.input.text, "location");
  }

   else if(req.body.input.text.toLowerCase() == "online" || req.body.input.text == "friends" ||  req.body.input.text.includes("online") || req.body.input.text.includes("web") || req.body.input.text.includes("family") || req.body.input.text.includes("friends")){
    //Add the source
    newStudentLookup(req.body.context.conversation_id, req.body.input.text, "source");
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
//console.log(JSON.stringify(response,null,2));
response.output.text = response.output.text + addLink + featureNames;
res.json(response);
}
});
});

module.exports = router;





