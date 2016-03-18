/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
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
/* global $ */
'use strict';

var Microphone = require('./Microphone');
var handleMicrophone = require('./handlemicrophone').handleMicrophone;
var Voice = require('../Voice');
var utils = require('./utils');

exports.initRecordButton = function(ctx) {

  var recordButton = $('#recordButton'),
      timeoutId = 0,
      running = false,
      mic;

  // Requires user to hold down before mic is activated.
  recordButton.mousedown(function() {
    var audio = $('.audio').get(0);
    if (!audio.ended) {
      return
    } else {
      timeoutId = setTimeout(handleRecord, 1000);
    }
  }).bind('mouseup mouseleave', function() {
    clearTimeout(timeoutId);
  });

  // Callback to begin recording.
  var handleRecord = function() {
    running = true;
    var token = ctx.token;
    var micOptions = {
      bufferSize: ctx.buffersize
    };
    mic = new Microphone(micOptions);

    return function(evt) {
      var currentModel = localStorage.getItem('currentModel'),
          currentlyDisplaying = localStorage.getItem('currentlyDisplaying');

      $('#resultsText').val('');   // clear hypotheses from previous runs
      handleMicrophone(token, currentModel, mic, function(err) {
        if (err) {
          var msg = 'Error: ' + err.message;
        } else {
          recordButton.css('background-color', '#d74108');
          recordButton.find('img').attr('src', 'images/stop.svg');
          $('#hold-span').css('display', 'none')
          $('#speaking-span').css('display', 'initial')
          console.log('starting mic');
          mic.record();
        }
      });
    }();
  };

  // Handles the release of the mouse button. Triggers AI response.
  recordButton.mouseup(function () {
    if (!running) {
      return
    }
    recordButton.removeAttr('style');
    recordButton.find('img').attr('src', 'images/microphone.svg');
    $('#hold-span').css('display', 'initial')
    $('#speaking-span').css('display', 'none')
    setTimeout(function () {
      console.log('Stopping microphone, sending stop action message');

      $.publish('hardsocketstop');
      mic.stop();

      var voice = new Voice();

      if (mic.message) {
        var text = "Hi, " + mic.message + " <br> It's a pleasure to meet you.",
          spokenText = "Hi, ^200 " + mic.message + ". ^500 It's ^50 a ^50 pleasure ^50 to ^50 meet ^50 you.";
      } else {
        var text = "I'm sorry. <br> Can you please repeat that?",
          spokenText = "I'm ^200 sorry. ^500 Can ^50 you ^50 please ^50 repeat that?";
      }

      voice.synthesizeRequest(text);
      utils.typeText(spokenText);

      running = false
    }, 1000)
  });
};
