var Round = require('./round').Round;
var politics = require('../recurses/politics.json')

function Game (io, gameId, team1, team2) {

  var game = this;
  game.id = gameId;
  game.running = false;
  game.countdown = false;
  game.end = false;
  game.teams = [team1, team2];
  game.ball = {
    position: 0,
    speed: 0
  };

  game.politics = JSON.parse(JSON.stringify(politics));

  game.staticBallTime = 0;
  game.timeLeft = 4;

  game.round = new Round();
  game.width = 1200;

  game.update = update;
  game.endGame = endGame;

  team1.onNewWord = newWord;
  team2.onNewWord = newWord;

  team1.onLeave = teamLeave;
  team2.onLeave = teamLeave;

  team1.onLoadSong = loadSong;
  team2.onLoadSong = loadSong;

  team1.onGetPicks = getPicks
  team2.onGetPicks = getPicks

  team1.onPickDone = pickDone
  team2.onPickDone = pickDone

  return game;

  function loadSong (socket) {
    socket.emit('loadSong', game.round.song.id);
  }

  function playNexSong() {
    game.round.changeSong();
    io.to(game.id).emit('loadSong', game.round.song.id);
    setTimeout(function () {
      io.to(game.id).emit('playSong');
    }, 1000);
  }
  function newWord (teamId, word, player, callback) {
    var result = checkWord(word, player);
    if (game.round.song.allAnswered === true) {
      playNexSong();
    }
    if (result === true) {
      if (teamId === team1.id) {
        game.ball.speed++;
        if (game.ball.speed === 0) {
          game.ball.speed++;
        }
      } else {
        game.ball.speed--;
        if (game.ball.speed === 0) {
          game.ball.speed--;
        }
      }
    }
    callback({
      ok: result,
      type: 'e',
      answer: game.round.answer
    })
  }

  function checkWord (word, player) {
    var result = false;

    if (word === '/power' && player.power === true) {
      switch(player.hero.pickId) {
        case 2:
          if (player.teamId === game.teams[0]) {
            if (game.ball.speed > 0) game.ball.speed += 2;
          } else {
            if (game.ball.speed < 0) game.ball.speed -= 2;
          }
          break;
        case 9:
          game.ball.speed = parseInt((game.ball.speed/2) * -1);
          if (game.ball.speed === 0) {
            if (player.teamId === game.teams[0]) {
              game.ball.speed = 1;
            } else {
              game.ball.speed = -1;
            }
          }
          break;
        case 7:
          playNexSong();
          break;
        case 8:
          if (player.teamId === game.teams[0]) {
            game.ball.position += 200;
          } else {
            game.ball.position -= 200;
          }

          setTimeout(function(){
            if (player.teamId === game.teams[0]) {
              game.ball.position -= 400;
            } else {
              game.ball.position += 400;
            }
          }, 5000);
          break;
        default:
          game.ball.speed = 0;
      }

      player.power = false;
    }

    if ( word === 'orozco') return true;
    for (var i in game.round.song) {
      if (game.round.song.hasOwnProperty(i)) {
        if (game.round.song[i] === word && game.round.answer[i] === false) {
          result = i;
          break;
        }
      }
    }

    if (result !== false) {
      game.round.answer[result] = word;
      result = true;
    }

    if (allAnswered()) {
      game.round.song.allAnswered = true;
    }

    return result;
  }

  function allAnswered () {
    for (var i in game.round.answer) {
      if (game.round.answer[i] == false) {
        return false;
      }
    }
    return true;
  }

    function teamLeave(teamId) {
        var winner = team1.id === teamId ? team2 : team1;
        endGame(winner);
    }

  function getPicks (teamId, ideology) {
    var enemy = game.teams[0].id === teamId ? game.teams[1].team : game.teams[0].team;
    var team = game.teams[0].id === teamId ? game.teams[0].team : game.teams[1].team;
    io.to(teamId).emit('loadPicks', {
      team: team,
      enemy: enemy,
      picks: game.politics[ideology]
    })
  }

  function pickDone () {
    setEnablePicks(team1.ideology, team1.team);
    setEnablePicks(team2.ideology, team2.team);
    getPicks(team1.id, team1.ideology);
    getPicks(team2.id, team2.ideology);
    if (team1.pickReady() && team2.pickReady()) {
      io.to(game.id).emit('lets play')
    }
  }

  function setEnablePicks (ideology, team) {
    game.politics[ideology].forEach(function (politic) {
      politic.enabled = true
      team.forEach(function (hero) {
        if (politic.pickId === hero.pickId) {
          politic.enabled = false
        }
      })
    })
  }

  // update game
  function update () {
    var lastCheck;
    if (team1.ready && team2.ready && !game.running) {
      if (!game.start) {
        game.start = Date.now();
      }
      lastCheck = game.timeLeft;
      game.timeLeft = Math.floor((4000 - (Date.now() - game.start)) / 1000);
      if (game.timeLeft != lastCheck) {
        if (game.timeLeft < 0) {
          game.running = true;
          game.start = Date.now();
          io.to(game.id).emit('playSong');
        }
        io.to(game.id).emit('countdown', game.timeLeft);
      }
    } else if (game.running) {
      // update teams
      game.teams.forEach(function (team) {
        team.update()
      });

      if (game.ball.position > game.width / 2) {
        //team 1 winn
        io.to(team1.id).emit('explosion', game.ball.position);
        io.to(team2.id).emit('explosion', -game.ball.position);
        endGame(team1)
      } else if (game.ball.position < -game.width / 2) {
        //team 2 winn
        io.to(team1.id).emit('explosion', game.ball.position);
        io.to(team2.id).emit('explosion', -game.ball.position);
        endGame(team2)
      } else {
        game.ball.position += game.ball.speed;
        team1.update({
          ball: {
            position: game.ball.position,
            speed: game.ball.speed
          },
          answer: game.round.answer
        });
        team2.update({
          ball: {
            position: -game.ball.position,
            speed: -game.ball.speed
          },
          answer: game.round.answer
        })
      }
    }
  }

    // end game function, save game to database
    function endGame(winner) {
        game.running = false;
        game.end = true;
        io.to(game.id).emit('game over', winner.ideology);
        game.teams.forEach(function (team) {
            team.endGame()
        })
    };
}

exports.Game = Game;