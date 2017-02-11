function Team(io, gameId, teamId) {

    var team = this

    team.ready = false
    team.io = io
    team.gameId = gameId
    team.id = teamId
    team.players = []
    team.endGame = endGame
    team.addPlayer = addPlayer
    team.update = update


    return team

    function addPlayer(player) {
        team.players.push(player)
        initPlayer(player)
    }

    function initPlayer(player) {
        player.socket.join(team.id);

        player.socket.on('ready', function () {
            player.ready = true;
            checkTeamReady();
        })

        player.socket.on('new word', function (word, callback) {
            if (team.onNewWord) {
                team.onNewWord(teamId, word, hero, callback);
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
            console.log(player.socket);
            team.onLoadSong(player.socket);
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
        if (!areMore && team.onTeamLeave) {
            team.onLeave(teamId)
        }
    }

    function update(position) {
        io.to(team.id).emit('ballPosition', position)
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