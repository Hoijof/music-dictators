function Player (gameId, socket, user) {

  var player = this;
  player.ready = false;
  player.out = false;
  player.gameId = gameId;
  player.socket = socket;
  player.user = user;

  return player
}

exports.Player = Player