module.exports = function (io, User, Message, Game, moment) {

    // import game loop and init
    var gamesLogic = require('./gameModule');
    var Team = require('../libs/team').Team
    var Player = require('../libs/player').Player
    gamesLogic.start(io, Game);

    // module vars
    var connectedUsers = {};
    var games = {};
    var gameId = 0;
    var teamId = 0;
    var playerId = 0;

    // on connect event handeler
    io.on('connection', function (socket) {

        // socket init request
        socket.on('init', function (data, callback) {
            connectedUsers[socket.id] = data._id;
            changeConected(data._id, true);
            refreshUsers()
            Message.find({
                $or: [{
                    to: data._id
                }, {
                    from: data._id
                }]
            }, function (err, messages) {
                callback(err, messages);
            });
        });

        // socket image upload
        socket.on('new img', function (data, callback) {
            User.findById(data.id, function (err, user) {
                if (!user) {
                    return res.status(400).send({
                        message: 'User not found'
                    });
                } else {
                    var base64Data = data.img.replace(/^data:image\/png;base64,/, "");

                    require("fs").writeFile('../client/img/' + data.id + '.png', base64Data, 'base64', function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            user.img = 'img/' + data.id + '.png' || user.img;
                            user.save(function (err) {
                                if (!err) {
                                    callback('img/' + data.id + '.png');
                                }
                            });
                        }
                    });

                }
            });
        });

        // socket chat message request
        socket.on('refresh chat', function (data, callback) {
            Message.find({
                $or: [{
                    to: data._id
                }, {
                    from: data._id
                }]
            }, function (err, messages) {
                callback(err, messages);
            });
        });

        // socket users refresh request
        socket.on('refresh users', function () {
            refreshUsers();
        });

        // socket send new message event
        socket.on('new message', function (data) {
            var message = new Message({
                from: data.from,
                to: data.to,
                message: data.message,
                time: moment(),
                readed: false
            });
            message.save(function (err) {
                io.emit('new messages');
            });
        });

        // socket read messages
        socket.on('reading', function (data) {
            Message.update({
                from: data.from,
                to: data.to
            }, {
                readed: true
            }, {
                multi: true
            }, function (err, affected) {
                socket.emit('new messages');
            });
        });

        // socket init gameboart
        socket.on('init gameboard', function () {
            refreshGames();
        });

        // socket create game
        socket.on('new game', function (data, callback) {
            var gId = 'game' + gameId;
            games[gId] = {
                maker: data
            };
            var t1Id = 'team' + teamId++;
            var t2Id = 'team' + teamId++;
            games[gId].team1 = new Team(io, gId, t1Id, 'right');
            games[gId].team2 = new Team(io, gId, t2Id, 'left');
            var player = new Player(gId, socket, data);
            if (data.ideology === 'capitalist') {
                games[gId].team1.addPlayer(player);
            } else {
                games[gId].team2.addPlayer(player);
            }
            socket.join(gId);
            callback(gId);
          gamesLogic.pushGame(gId, games[gId].team1, games[gId].team2);
            gameId++;
            refreshGames();
        });

        // socket cancel game
        socket.on('cancel game', function (id) {
            // delete games[id];
            games[id].team1.removeSocket(socket)
            games[id].team2.removeSocket(socket)
            if (games[id].team1.players.length <= 0 && games[id].team2.players.length <= 0) {
                delete games[id];
            }
            refreshGames();
        });

        // socket join existing game
        socket.on('join game', function (data, callback) {
            var game = games[data.gameId];
            var player = new Player(data.gameId, socket, data.user);
            if (data.user.ideology === 'capitalist') {
                game.team1.addPlayer(player);
            } else {
                game.team2.addPlayer(player);
            }
            if (!game.team1.full || !game.team2.full) {
                callback(data.gameId);
            }
            socket.join(data.gameId);
            // io.to(data.gameId).emit('lets play');
            // gamesLogic.pushGame(data.gameId, game.team1, game.team2);
            // delete games[data.gameId];
            refreshGames();
        });

        // socket statistics request
        socket.on('get statistics', function (id, callback) {
            Game.find({
                $or: [{
                    'player1.id': id
                }, {
                    'player2.id': id
                }]
            }, function (err, games) {
                callback(err, games);
            });
        });

        // socket disconnect handeler
        socket.on('disconnect', function () {
            var disconnectUser = true;
            var id = connectedUsers[socket.id];
            delete connectedUsers[socket.id];
            for (var key in connectedUsers) {
                if (connectedUsers[key] === id) {
                    disconnectUser = false;
                    break;
                }
            }
            for (var key in games) {
                games[key].team1.removeSocket(socket)
                games[key].team2.removeSocket(socket)
                if (games[key].team1.players.length <= 0 && games[key].team2.players.length <= 0) {
                    delete games[key];
                }
            }
            refreshGames();
            if (disconnectUser) {
                changeConected(id, false);
            }
        });
    });

    // change status of user
    function changeConected(id, status) {
        User.findById(id, function (err, user) {
            if (user) {
                user.connected = status;
                user.save(function (err) {
                    refreshUsers();
                });
            }
        });
    }

    // send games
    function refreshGames() {
        var g = [];
        for (var key in games) {
            if (games[key].team1.full && games[key].team2.full) {
                // gamesLogic.pushGame(key, games[key].team1, games[key].team2);
                io.to(key).emit('lets pick');
                delete games[key]
            } else {
                g.push({
                    id: key,
                    maker: games[key].maker.userName,
                    capitalists: games[key].team1.players.length,
                    communists: games[key].team2.players.length
                });
            }
        }
        io.emit('games', g);
    }

    // send users
    function refreshUsers() {
        User.find({}, '-email -img -__v', function (err, users) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].connected) {
                    users[i].lastConnection = Date.now();
                    users[i].save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
            io.sockets.emit('users', users);
        });
    }
};
