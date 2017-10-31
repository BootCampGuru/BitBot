var watson = require('watson-developer-cloud');
var extend = require('util')._extend;
var creds=require('./creds.json');
var vcapServices = require('vcap_services');

//create the service wrapper for Watson Speech to Text API
var speech_to_text = extend({
 version: 'v1',
 url: creds.STT_URL,
 username: process.env.STT_USERNAME || creds.STT_username,
 password: process.env.STT_PASSWORD || creds.STT_password,
}, vcapServices.getCredentials('speech_to_text'));

 exports.STT=speech_to_text;