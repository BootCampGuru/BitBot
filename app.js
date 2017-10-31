var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Botkit = require('botkit');
var index = require('./routes/index');
var users = require('./routes/users');
var conv = require('./routes/conv');
var feedback = require('./routes/feedback');
var getfeedback = require('./routes/getfeedback');
var getnewstudents = require('./routes/getnewstudents');
var watson = require('watson-developer-cloud');
var extend = require('extend');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');
var outFile = 'demo.wav';
var app = express();
var extend = require('util')._extend;
var i18n   = require('i18next');
varvcapServices = require('vcap_services');
var config ={
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: 'ea666f48-2f84-4475-92f1-c24ff5c6322f',
  password: 'WJnTPL7L5TlG'
};

// var credentials = extend(config, bluemix.getServiceCreds('speech_to_text'));
// var authorization = watson.authorization(credentials);

// app.get('/token', function(req,res){

//   authorization.getToken({url: credentials.url} , function(err, token){
//     console.log(token);
//   })
// };



var watsonMiddleware = require('botkit-middleware-watson')({
  username: "3857edc0-18b2-431d-b612-d36a45c5db66",
  password: "yy4QdeR6Teve",
  workspace_id: "25f58a86-15b7-4f14-8d02-8dd328e2a062",
  version_date: "2017-05-26",
  minimum_confidence: 0.50, // (Optional) Default is 0.75
});

var slackController = Botkit.slackbot();

var slackBot = slackController.spawn({
  token: "xoxb-263434244532-C8aJizzHaofkmA2PCxg6qSZz"
});



slackController.middleware.receive.use(watsonMiddleware.receive);
slackBot.startRTM();

slackController.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  if (message.watsonError) {
    bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  } else {
    bot.reply(message, message.watsonData.output.text.join('\n'));
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/conv', conv);
app.use('/feedback', feedback);
app.use('/getfeedback', getfeedback);
app.use('/getnewstudents', getnewstudents);

// Call the Watson Speech to Text API
app.use('/api/speech-to-text/', require('./stt-token.js'));

//listen

// binaryServer = BinaryServer({port: 9001});

// binaryServer.on('connection', function(client) {
//   console.log('new connection');

//   var fileWriter = new wav.FileWriter(outFile, {
//     channels: 1,
//     sampleRate: 48000,
//     bitDepth: 16
//   });

//   client.on('stream', function(stream, meta) {
//     console.log('new stream');
//     stream.pipe(fileWriter);

//     stream.on('end', function() {
//       fileWriter.end();
//       console.log('wrote to file ' + outFile);
//     });
//   });
//   });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;