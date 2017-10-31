'use strict';

var express = require('express'),
  router = express.Router(), // eslint-disable-line new-cap
  vcapServices = require('vcap_services'),
  extend = require('util')._extend,
  watson = require('watson-developer-cloud');

  //require Watson Service credentials
var creds=require('./config/creds.json');
//Require the Watson Speech to Text API defined in servicedefs.js
var sttVar = require('./config/servicedefs.js');
// set up an endpoint to serve speech-to-text auth tokens
var sttAuthService = watson.authorization(sttVar.STT);
router.get('/token', function(req, res) {
 sttAuthService.getToken({url: creds.STT_URL}, function(err, token) {
 if (err) {
 console.log('Error retrieving token: ', err);
 res.status(500).send('Error retrieving token');
 return;
 }
 res.send(token);
 });
});



module.exports = router;