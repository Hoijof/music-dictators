var Round = require('./round').Round;
var politics = require('../recurses/politics.json')

function Game(io, gameId, team1, team2) {

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

    game.staticBallTime = 0;
    game.timeLeft = 4;

    game.round = new Round();

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

    function loadSong(socket) {
        socket.emit('loadSong', game.round.song.id);
    }

    function newWord(teamId, word, hero, callback) {
        checkWord(word);
        if (teamId === team1.id) {
            game.ball.speed++;
            if(game.ball.speed === 0) {
                game.ball.speed++;
            }
        } else {
            game.ball.speed--;
            if(game.ball.speed === 0) {
                game.ball.speed--;
            }
        }
        callback({
            ok : true,
            type : 'e'
        })
    }

    function checkWord(word) {
        console.log(word);
    }

    function teamLeave(teamId) {
        console.log('leave: ' + teamId);
        endGame();
    }

    function getPicks(teamId, ideology){
        var enemy = game.teams[0].id === teamId ? game.teams[1].team : game.teams[0].team;
        var team = game.teams[0].id === teamId ? game.teams[0].team : game.teams[1].team;
        io.to(teamId).emit('loadPicks', {
            team: team,
            enemy: enemy,
            picks: politics[ideology]
        })
    }

    function pickDone (){
        setEnablePicks(team1.ideology, team1.team);
        setEnablePicks(team2.ideology, team2.team);
        getPicks(team1.id, team1.ideology);
        getPicks(team2.id, team2.ideology);
    }

    function setEnablePicks(ideology, team) {
        politics[ideology].forEach(function(politic) {
            politics.enabled = true
            team.forEach(function(hero){
                if(politic === hero) {
                    politics.enabled = false
                }
            })
        })
    }

    // update game
    function update() {
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

            game.ball.position += game.ball.speed;

            team1.update({
                ball: {
                    position: game.ball.position,
                    speed: game.ball.speed
                }
            });
            team2.update({
                ball: {
                    position: -game.ball.position,
                    speed: -game.ball.speed
                }
            })
        }
    }

    // end game function, save game to database
    function endGame() {
        game.running = false;
        game.end = true;
        io.to(game.id).emit('game over');
        game.teams.forEach(function (team) {
            team.endGame()
        })
    };
}

exports.Game = Game;