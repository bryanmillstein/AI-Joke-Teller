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
/*global $:false, SPEECH_SYNTHESIS_VOICES */

'use strict';

var models = require('../public/js/microphone/data/models.json').models;
var utils = require('../public/js/microphone/utils.js');
utils.initPubSub();
var initViews = require('../public/js/microphone/views.js').initViews;
var getModels = require('../public/js/microphone/models.js').getModels;

window.BUFFERSIZE = 8192

$(document).ready(function() {

  function synthesizeRequest(options, audio) {
    var sessionPermissions = JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1;
    var downloadURL = '/api/synthesize' +
      '?voice=' + options.voice +
      '&text=' + encodeURIComponent(options.text) +
      '&X-WDC-PL-OPT-OUT=' +  sessionPermissions;


    audio.pause();
    try {
      audio.currentTime = 0;
    } catch(ex) {
      // ignore. Firefox just freaks out here for no apparent reason.
    }
    audio.src = downloadURL;
    audio.play();
    return true;
  }

  function typeText(text) {
      $(".spokenText").typed({
        strings: [text],
        showCursor: true,
        startDelay: 750,
        backSpeed: -25
      });
  }

  var voice = 'en-US_AllisonVoice',
    audio = $('.audio').get(0),
    textArea = $('#textArea'),
    text = "Hi, my name is Allison. <br> What is your name?",
    spokenText = "Hi, ^200 my ^200 name ^200 is ^200 Allison. ^200 What ^50 is ^50 your ^50 name?",
    spokenText2 = "What up dude?"

  var utteranceOptions = {
    text: text,
    voice: voice,
    sessionPermissions: JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1
  };

  synthesizeRequest(utteranceOptions, audio);
  typeText(spokenText);

  audio.addEventListener("ended", function(){
    $('#hold-span').css('display', 'initial')
    // $('#recordButton').click(true);
  });

// START SPEECH TO TEXT

  var tokenGenerator = utils.createTokenGenerator();

  // Make call to API to try and get token
  tokenGenerator.getToken(function(err, token) {
    window.onbeforeunload = function() {
      localStorage.clear();
    };

    if (!token) {
      console.error('No authorization token available');
      console.error('Attempting to reconnect...');
    }

    var viewContext = {
      currentModel: 'en-US_BroadbandModel',
      models: models,
      token: token,
      bufferSize: BUFFERSIZE
    };

    initViews(viewContext);

    // Save models to localstorage
    localStorage.setItem('models', JSON.stringify(models));

    //Check if playback functionality is invoked
    localStorage.setItem('playbackON', false);
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for(var i=0; i< vars.length; i++) {
      var pair = vars[i].split('=');
      if(decodeURIComponent(pair[0]) === 'debug') {
        localStorage.setItem('playbackON',decodeURIComponent(pair[1]));
      }
    }

    // Set default current model
    localStorage.setItem('currentModel', 'en-US_BroadbandModel');
    localStorage.setItem('sessionPermissions', 'true');

    getModels(token);
  });
});
