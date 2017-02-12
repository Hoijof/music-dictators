var politics = require('../recurses/politics.json')

function Team(io, gameId, teamId, ideology) {

    var team = this

    team.ready = false
    team.io = io
    team.gameId = gameId
    team.id = teamId
    team.ideology = ideology
    team.players = []
    team.team = []
    team.maxPlayers = 1
    team.full = false
    team.endGame = endGame
    team.addPlayer = addPlayer
    team.update = update
    team.removeSocket = removeSocket
    team.pickReady = pickReady


    return team

    function addPlayer(player) {
        if (!team.full) {
            team.players.push(player);
            initPlayer(player);
        }
        if (team.players.length >= team.maxPlayers) {
            team.full = true;
        }
    }

    function removeSocket(socket) {
        for (var i = 0; i < team.players.length; i++) {
            if (team.players[i].socket === socket) {
                team.players.splice(i, 1)
                team.full = false;
                return
            }
        }
    }

    function initPlayer(player) {
        player.setHero(politics['dunno'])
        player.socket.join(team.id);

        player.socket.on('ready', function () {
            player.ready = true;
            checkTeamReady();
        })

        player.socket.on('new word', function (word, callback) {
            if (team.onNewWord) {
                team.onNewWord(teamId, word, player.hero, callback.bind(callback));
            }
        })

        player.socket.on('leave', function () {
            player.out = true;
            areMorePlayers();
        })

        player.socket.on('disconnect', function () {
            player.out = true;
            areMorePlayers();
        })

        player.socket.on('loadSong', function () {
            team.onLoadSong(player.socket);
        })

        player.socket.on('getPicks', function() {
            setTeam()
            team.onGetPicks(team.id, team.ideology);
        })

        player.socket.on('pickDone', function (id) {
            var heroes = politics[team.ideology]
            var hero = heroes.find(function(hero){
                return hero.pickId === id
            })
            player.setHero(hero);
            player.pickReady = true;
            setTeam();
            team.onPickDone();
        })
    }

    function pickReady () {
        if(!team.players.length){
            return false
        }
        var ready = true
        team.players.forEach(function(player) {
            if(!player.pickReady){
                ready = false
            }
        })
        return ready
    }

    function setTeam () {
        team.team = []
        team.players.forEach(function(player){
            team.team.push(player.hero)
        })
    }

    function checkTeamReady() {
        team.players.forEach(function (player) {
            if (!player.ready) {
                return;
            }
        })
        team.ready = true;
    }

    function areMorePlayers() {
        var areMore = false
        team.players.forEach(function (player) {
            if (!player.out) {
                areMore = true
            }
        })
        if (!areMore && team.onLeave) {
            team.onLeave(teamId)
        }
    }

    function update(data) {
        io.to(team.id).emit('updateGame', data)
    }

    function endGame() {
        team.players.forEach(function (player) {
            player.socket.removeAllListeners('ready');
            player.socket.removeAllListeners('new word');
            player.socket.removeAllListeners('leave');
        })
    }
}

exports.Team = Team