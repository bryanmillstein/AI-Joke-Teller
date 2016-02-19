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

exports.initRecordButton = function(ctx) {

  var recordButton = $('#recordButton'),
      timeoutId = 0,
      running = false,
      mic;

  recordButton.mouseup(function () {
    if (!running) {
      return
    }
    recordButton.removeAttr('style');
    recordButton.find('img').attr('src', 'images/microphone.svg');
    setTimeout(function () {
      console.log('Stopping microphone, sending stop action message');

      $.publish('hardsocketstop');
      mic.stop();
      running = false
    }, 2000)
  });

  recordButton.mousedown(function() {
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
          console.log('starting mic');
          mic.record();
        }
      });
    }();
  });
};
