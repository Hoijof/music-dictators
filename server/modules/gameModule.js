// global module vars
var io;
var games;
var dictionary = require('../recurses/words').dictionary;
var width = 1200;
var heigth = 600;
var GameSchema;

// game loop
var loop = function() {
	for (var i = 0; i < games.length; i++) {
		games[i].update();
	}
};

// remove game
var removeGame = function(id) {
	for (var i = 0; i < games.length; i++) {
		if (games[i].getId() === id) {
			games.splice(i, 1);
			console.log('games running: ' + games.length);
			return;
		}
	}
};

// game object
function Game(gid, sk1, sk2, p1d, p2d) {

	// atributes
	var player1Data = p1d;
	var player2Data = p2d;
	var socket1 = sk1;
	var socket2 = sk2;
	var player1 = new Player(sk1, sk2);
	var player2 = new Player(sk2, sk1);
	var running = false;
	var p1SpecialReady = false;
	var p2SpecialReady = false;
	var specialManager = new SpecialManager();
	var id = gid;
	var timeLeft = 4;
	var start = Date.now();
	var p1ready = false;
	var p2ready = false;

	// sockets events
	// socket ready
	socket1.on('ready', function() {
		sk1.emit('oponent data', {
		    id : player2Data._id,
		    userName : player2Data.userName,
		    img : player2Data.img
		});
		p1ready = true;
		if (p2ready) {
			start = Date.now();
		}

	});

	socket2.on('ready', function() {
		sk2.emit('oponent data', {
		    id : player1Data._id,
		    userName : player1Data.userName,
		    img : player1Data.img
		});
		p2ready = true;
		if (p1ready) {
			start = Date.now();
		}

	});

	// socket sends word
	socket1.on('new word', function(w, callback) {
		if (!player1.newUnit(w)) {
			if (player2.shoot(w)) {
				player1.correctWords++;
				player1.kills++;
				callback({
				    ok : true,
				    type : 'e'
				});
			} else if (specialManager.getType() !== null && w === specialManager.getWord()) {
				specialManager.resolveSpecial(player1);
				socket2.emit('loose special');
				player1.specials++;
				callback({
				    ok : true,
				    type : 's'
				});
			} else {
				player1.incorrectWords++;
				callback({
				    ok : false,
				    type : ''
				});
			}
		} else {
			callback({
			    ok : true,
			    type : 'u'
			});
		}
	});

	socket2.on('new word', function(w, callback) {
		if (!player2.newUnit(w)) {
			if (player1.shoot(w)) {
				player2.correctWords++;
				player2.kills++;
				callback({
				    ok : true,
				    type : 'e'
				});
			} else if (specialManager.getType() !== null && w === specialManager.getWord()) {
				specialManager.resolveSpecial(player2);
				socket1.emit('loose special');
				player2.specials++;
				callback({
				    ok : true,
				    type : 's'
				});
			} else {
				player2.incorrectWords++;
				callback({
				    ok : false,
				    type : ''
				});
			}
		} else {
			callback({
			    ok : true,
			    type : 'u'
			});
		}
	});

	// socket ready for special
	socket1.on('special ready', function() {
		p1SpecialReady = true;
	});

	socket2.on('special ready', function() {
		p2SpecialReady = true;
	});

	// socket leave game
	socket1.on('leave', function() {
		player2.win = true;
		endGame();
	});

	socket2.on('leave', function() {
		player1.win = true;
		endGame();
	});

	socket1.on('disconnect', p1disconnect);

	function p1disconnect() {
		player2.win = true;
		endGame();
	}

	socket2.on('disconnect', p2disconnect);

	function p2disconnect() {
		if (running) {
			player1.win = true;
			endGame();
		}
	}

	// update game
	this.update = function() {
		var lastCheck;
		if (p1ready && p2ready && !running) {
			lastCheck = timeLeft;
			timeLeft = Math.floor((4000 - (Date.now() - start)) / 1000);
			if (timeLeft != lastCheck) {
				if (timeLeft < 0) {
					running = true;
					start = Date.now();
					player1.newWord();
					player2.newWord();
				}
				io.to(id).emit('countdown', timeLeft);
			}
		} else if (running) {
			// update game time left and resolve
			lastCheck = timeLeft;
			timeLeft = Math.floor((100000 - (Date.now() - start)) / 1000);
			if (timeLeft < 0) {
				if (player1.score > player2.score) {
					player1.win = true;
					endGame();
				} else {
					player2.win = true;
					endGame();
				}
			} else if (timeLeft != lastCheck) {
				io.to(id).emit('time left', timeLeft);
			}

			// update players
			if (player1.update()) {
				player2.life -= 20;
				player2.send();
				if (player2.life <= 0) {
					player1.win = true;
					endGame();
				}
			}

			if (player2.update()) {
				player1.life -= 20;
				player1.send();
				if (player1.life <= 0) {
					player2.win = true;
					endGame();
				}
			}

			// update special manager
			if (p1SpecialReady && p2SpecialReady) {
				p1SpecialReady = false;
				p2SpecialReady = false;
				player1.reversed = false;
				player2.reversed = false;
				specialManager.setType();
				io.to(id).emit('special word', specialManager.getWord());
			}

			if (specialManager.update()) {
				io.to(id).emit('special ready');
			}
		}
	};

	// return game id
	this.getId = function() {
		return id;
	};

	// end game function, save game to database
	var endGame = function() {
		running = false;
		p1ready = false;
		p2ready = false;
		var game = new GameSchema({
		    player1 : {
		        id : p1d._id,
		        wordsTyped : player1.correctWords + player1.incorrectWords,
		        correctWords : player1.correctWords,
		        incorrectWords : player1.incorrectWords,
		        unitsCreated : player1.createdUnits,
		        unitsKilled : player1.kills,
		        specials : player1.specials,
		        score : player1.score,
		        win : player1.win
		    },
		    player2 : {
		        id : p2d._id,
		        wordsTyped : player2.correctWords + player2.incorrectWords,
		        correctWords : player2.correctWords,
		        incorrectWords : player2.incorrectWords,
		        unitsCreated : player2.createdUnits,
		        unitsKilled : player2.kills,
		        specials : player2.specials,
		        score : player2.score,
		        win : player2.win
		    },
		    date : start,
		    duration : Math.round((Date.now() - start) / 1000)
		});

		game.save(function(err) {
			if (err) {
				console.log(err);
			}
			io.to(id).emit('game over', game);
			socket1.leave(id);
			socket2.leave(id);
			removeListeners(socket1);
			removeListeners(socket2);

			removeGame(id);
		});

	};
	
	// remove game listeners.
	var removeListeners = function(sk) {
		sk.removeAllListeners('ready');
		sk.removeAllListeners('new word');
		sk.removeAllListeners('special ready');
		sk.removeAllListeners('leave');
		sk.removeListener('disconnect', p1disconnect);
		sk.removeListener('disconnect', p2disconnect);
	}
}

// player object
function Player(sk, ensk) {

	// player attributes
	var socket = sk;
	var enemieSoket = ensk;
	var units = [];
	var word;
	var mustSend = true;
	var initTime;
	var timeLeft = 5;

	this.level = 0;
	this.correctWords = 0;
	this.incorrectWords = 0;
	this.kills = 0;
	this.createdUnits = 0;
	this.life = 100;
	this.score = 0;
	this.specials = 0;
	this.reversed = false;
	this.win = false;

	// remove unit
	var removeUnit = function(index) {
		units.splice(index, 1);
	};

	// get new word
	this.newWord = function() {
		word = dictionary[this.level][Math.floor(Math.random() * dictionary[this.level].length)];
		socket.emit('unit word', word);
		initTime = Date.now();
	};

	// check word and create new unit
	this.newUnit = function(w) {
		if (w === word) {
			var unit = {
			    word : (this.reversed) ? w.split("").reverse().join("") : w,
			    x : 0,
			    y : 90,
			    speed : 4
			};
			units.push(unit);
			this.createdUnits++;
			this.correctWords++;
			this.newWord();
			initTime = Date.now();
			return true;
		}
		return false;
	};

	// add unit
	this.addUnit = function(unit) {
		units.push(unit);
	};

	// resolve oponent shoot
	this.shoot = function(word) {
		for (var i = 0; i < units.length; i++) {
			if (units[i].word == word) {
				socket.emit('unit explosion', {
				    x : units[i].x,
				    y : units[i].y
				});
				enemieSoket.emit('enemie explosion', {
				    x : width - units[i].x,
				    y : heigth - units[i].y
				});
				removeUnit(i);
				return true;
			}
		}
		return false;
	};

	// send data
	this.send = function() {
		socket.emit('update units', {
		    units : units,
		    score : this.score,
		    life : this.life
		});
		enemieSoket.emit('update enemies', {
		    units : units,
		    score : this.score,
		    life : this.life
		});
		if (units.length <= 0) {
			mustSend = false;
		}
	};

	// update player
	this.update = function() {
		var lastCheck = timeLeft;
		timeLeft = Math.floor((7000 - (Date.now() - initTime)) / 1000);
		if (timeLeft < 0) {
			var unit = {
			    word : (this.reversed) ? word.split("").reverse().join("") : word,
			    x : 0,
			    y : 160,
			    speed : 3
			};
			this.addUnit(unit);
			this.newWord();
		} else if (timeLeft != lastCheck) {
			socket.emit('word time left', timeLeft);
		}
		var arrived = false;
		for (var i = 0; i < units.length; i++) {
			mustSend = true;
			units[i].x += units[i].speed;
			if (units[i].x > width) {
				socket.emit('unit explosion', {
				    x : units[i].x,
				    y : units[i].y
				});
				enemieSoket.emit('enemie explosion', {
				    x : width - units[i].x,
				    y : heigth - units[i].y
				});
				removeUnit(i);
				i--;
				arrived = true;
			}
		}
		this.score = this.correctWords * (this.level + 8) + this.kills * (this.level + 9) + this.createdUnits * 5 + this.specials * 15 - this.incorrectWords * (this.level + 3);
		var aux = Math.floor(this.score / 100);
		this.level = (aux < 0) ? 0 : (aux > 6) ? 5 : aux;
		if (mustSend) {
			this.send();
		}
		return arrived;
	};

}

// special manager object
function SpecialManager() {

	// special manager attributes
	var startTime = Date.now();
	var sent = false;
	var type = null;
	var word = [ 'medic', 'reinforcement', 'upside down' ];

	// special manager update
	this.update = function() {
		if (!sent && Date.now() - startTime > 10000) {
			startTime = Date.now();
			sent = true;
			return true;
		}
		return false;
	};

	// set new special
	var newSpecial = function() {
		startTime = Date.now();
		sent = false;
		type = null;
	};

	// set special type
	this.setType = function() {
		type = Math.floor(Math.random() * 3);
	};

	// return special type
	this.getType = function() {
		return type;
	};

	// return special word
	this.getWord = function() {
		return word[type];
	};

	// resolve special winner
	this.resolveSpecial = function(winner) {
		switch (type) {
		case 0:
			winner.life += 20;
			if (winner.life > 100) {
				winner.life = 100;
			}
			break;
		case 1:
			winner.addUnit({
			    word : dictionary[winner.level][Math.floor(Math.random() * dictionary[winner.level].length)],
			    x : -100,
			    y : 300,
			    speed : 3.5
			});
			winner.addUnit({
			    word : dictionary[winner.level][Math.floor(Math.random() * dictionary[winner.level].length)],
			    x : -150,
			    y : 230,
			    speed : 3.5
			});
			winner.addUnit({
			    word : dictionary[winner.level][Math.floor(Math.random() * dictionary[winner.level].length)],
			    x : -200,
			    y : 470,
			    speed : 2.5
			});
			break;
		case 2:
			winner.reversed = true;
			break;
		default:
			break;
		}
		newSpecial();
	};
}

// init vars and start game loop
exports.start = function(masterio, G) {
	io = masterio;
	GameSchema = G;
	games = [];
	setInterval(loop, 30);
};

// add new game
exports.pushGame = function(gameId, player1sk, player2sk, player1Data, player2Data) {
	games.push(new Game(gameId, player1sk, player2sk, player1Data, player2Data));
	console.log('games running: ' + games.length);
};