'use strict';

function Voice(options) {
  this.voice = 'en-US_AllisonVoice';
  this.audio = $('.audio').get(0);
}

module.exports = Voice;

Voice.prototype.synthesizeRequest = function(text) {
  var sessionPermissions = JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1;
  var downloadURL = '/api/synthesize' +
    '?voice=' + this.voice +
    '&text=' + encodeURIComponent(text) +
    '&X-WDC-PL-OPT-OUT=' +  sessionPermissions;


  this.audio.pause();
  try {
  this.audio.currentTime = 0;
  } catch(ex) {
    // ignore. Firefox just freaks out here for no apparent reason.
  }
  this.audio.src = downloadURL;
  this.audio.play();

  this.audio.addEventListener("ended", function(){
    $('#hold-span').css('display', 'initial')
  });

  return true;
}
