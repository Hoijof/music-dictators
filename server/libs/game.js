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
  }

  game.staticBallTime = 0
  game.timeLeft = 4

  game.update = update
  game.endGame = endGame

  team1.onNewWord = newWord;
  team2.onNewWord = newWord;

  team1.onLeave = teamLeave;
  team2.onLeave = teamLeave;

  return game;

  function newWord (teamId, word, hero) {
    console.log(teamId, word, hero);
    checkWord(word);
  }

  function checkWord (word) {
    console.log(word);
  }

  function teamLeave (teamId) {
    endGame();
  }

  // update game
  function update () {
    var lastCheck;
    if (team1.ready && team2.ready && !game.running) {
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
      })

      game.ball.position += game.ball.speed

      team1.update(game.ball.position)
      team2.update(-game.ball.position)
    }
  };

  // end game function, save game to database
  function endGame () {
    game.running = false;
    game.end = true;
    io.to(game.id).emit('game over');
    game.teams.forEach(function(team) {
      team.endGame()
    })
  };
}

exports.Game = Game