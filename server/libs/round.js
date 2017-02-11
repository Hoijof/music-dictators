var songDictionary = require('../recurses/songs');

function Round() {
    var round = this;

    round.song = songDictionary.songs[Math.floor(Math.random()*songDictionary.songs.length)];

    return round;
}

exports.Round = Round;