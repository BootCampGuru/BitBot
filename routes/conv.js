var auth = require('../auth');
var express = require('express');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var db = require('node-mysql');
var sqldb = require('mysql');
var wav = require('wav');
var router = express.Router();
var jsonParser = bodyParser.json();
var validator = require("email-validator");
var conversation = watson.conversation(auth.watson.conversation);
var toneAnalyzer = watson.tone_analyzer(auth.tone_analyzer);
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');
var tts = watson.text_to_speech(auth.text_to_speech);
var memorystream = require('memorystream');
var translator = watson.language_translation(auth.language_translation);



var textToSpeech = new TextToSpeechV1(
{

  username: '',
  password: ''
});



var SpeechToText = new SpeechToTextV1(
{

  username: '',
  password: ''
});



//Analyzes the tone of new students
function ToneAnalyzer(analyzethis)
{
toneAnalyzer.tone({text:analyzethis}, function(err,result){
  if(err)
    throw err;

var cats = result.document_tone.tone_categories;
cats.forEach(function(cat){
  cat.tones.forEach(function(tone){
    //console.log(" %s:%s",tone.tone_name, tone.score);
    if(tone.tone_name == "sadness")
    {
      if(parseInt(tone.score) > 0.2)
      {
        addLink = " We are here to help, don't you despair!";
      }
    }
  })
})
 
});
}
 var connection = sqldb.createConnection({
  host: "rocklobster.cmglveqlnmr0.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "api_user",
  password: "ABC123",
  database: "codingBootcamp_db"
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
  else if(req.body.input.text.toLowerCase().includes("help"))
  {
    ToneAnalyzer(req.body.input.text);
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


// translator.translate({
// text : response.output.text + addLink + featureNames,
// source:"en",
// target:"es"
// }, function(err, result){
//    if(err) {
//    return console.log(err);
//     }
//     //console.log(result.translations[0].translation);


// const getFileExtension = (acceptQuery) => {
//   const accept = acceptQuery || '';
//   switch (accept) {
//     case 'audio/ogg;codecs=opus':
//     case 'audio/ogg;codecs=vorbis':
//       return 'ogg';
//     case 'audio/wav':
//       return 'wav';
//     case 'audio/mpeg':
//       return 'mpeg';
//     case 'audio/webm':
//       return 'webm';
//     case 'audio/flac':
//       return 'flac';
//     default:
//       return 'mp3';
//   }
// };




//   });


var memStream = new memorystream();

var data = '';

memStream.on('data', function(chunk) {
  data += chunk.toString();
});


memStream.on('end', function(){
  
  var reader = new wav.Reader();

  reader.on('format', function (format) {
 
  // the WAVE header is stripped from the output of the reader 
  //reader.pipe(new Speaker(format));
});
 
// pipe the WAVE file to the Reader instance 
memStream.pipe(reader);


})



var wstream = fs.createWriteStream('HelloWatson.wav');

wstream.on('finish', function(){
  
  var reader = new wav.Reader();

  var file = fs.createReadStream('HelloWatson.wav');

  reader.on('format', function (format) {
 
  // the WAVE header is stripped from the output of the reader 
 // reader.pipe(new Speaker(format));
});
 
// pipe the WAVE file to the Reader instance 
file.pipe(reader);


})


textToSpeech.synthesize(
{
  text: response.output.text,
  voice: 'en-US_AllisonVoice',
  accept: 'audio/wav'
}
  ).pipe(wstream);



res.json(response);

}
});
});

module.exports = router;





