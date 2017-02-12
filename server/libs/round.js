var songDictionary = require('../recurses/songs');

function Round () {
  var round = this;

  this.changeSong = function () {
    round.song = songDictionary.songs[Math.floor(Math.random() * songDictionary.songs.length)];
    round.answer = {};

    for (var i in round.song) {
      if (round.song.hasOwnProperty(i)) {
        round.answer[i] = false;
      }
    }

    console.log(round.answer);
    return round.song;
  };

  this.changeSong();

  return round;


}


exports.Round = Round;