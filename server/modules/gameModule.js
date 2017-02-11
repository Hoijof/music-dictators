// global module vars
var io;
var games;
// var dictionary = require('../recurses/words').dictionary;
// var width = 1200;
// var heigth = 600;
var GameSchema;
var Game = require('../libs/game').Game

// game loop
var loop = function () {
  for (var i = 0; i < games.length; i++) {
    if(games[i].end){
      removeGame(games[i].id)
    } else {
      games[i].update();
    }
  }
};

// remove game
var removeGame = function (id) {
  for (var i = 0; i < games.length; i++) {
    if (games[i].id === id) {
      games.splice(i, 1);
      console.log('games running: ' + games.length);
      return;
    }
  }
};

// init vars and start game loop
exports.start = function (masterio, G) {
  io = masterio;
  GameSchema = G;
  games = [];
  setInterval(loop, 30);
};

// add new game
exports.pushGame = function (gameId, team1, team2) {
  var game = new Game(io, gameId, team1, team2);
  games.push(game);
  console.log('games running: ' + games.length);
};