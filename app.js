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
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

var app = express();





app.get('/api/synthesize', (req, res, next) => {
  const transcript = textToSpeech.synthesize(req.query);
  transcript.on('response', (response) => {
    if (req.query.download) {
      response.headers['content-disposition'] = `attachment; filename=transcript.${getFileExtension(req.query.accept)}`;
    }
  });
  transcript.on('error', next);
  transcript.pipe(res);
});


// error-handler settings
//require('./config/error-handler')(app);



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
