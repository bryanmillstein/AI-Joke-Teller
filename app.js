/**
 * Copyright 2014, 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express  = require('express'),
  app        = express(),
  request    = require('request'),
  vcapServices = require('vcap_services'),
  bluemix    = require('./config/bluemix'),
  extend     = require('util')._extend,
  watson     = require('watson-developer-cloud'),
  fs         = require('fs'),
  path       = require('path');

// Bootstrap application settings
require('./config/express')(app);

// For local development, replace username and password
var textToSpeech = watson.text_to_speech({
  version: 'v1',
  username: '12a020e3-0d14-4c03-9545-5078f4a03f5a',
  password: 'u4QCBqMNBk2V'
});

// For local development, replace username and password
var speechToText = extend({
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: '36207b14-dcdc-44b8-8efa-f4a594067def',
  password: 'kXLAgd6BlI1I'
}, vcapServices.getCredentials('speech_to_text'));

var authService = watson.authorization(speechToText);

app.get('/', function(req, res) {
  res.render('index', { ct: req._csrfToken });
});

// Get token using your credentials
app.post('/api/token', function(req, res, next) {
  authService.getToken({url: speechToText.url}, function(err, token) {
    if (err)
      next(err);
    else
      res.send(token);
  });
});

app.get('/api/synthesize', function(req, res, next) {
  var transcript = textToSpeech.synthesize(req.query);
  transcript.on('response', function(response) {
    if (req.query.download) {
      response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
    }
  });
  transcript.on('error', function(error) {
    next(error);
  });
  transcript.pipe(res);
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
