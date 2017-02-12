function Player(gameId, socket, user) {

    var player = this;
    player.ready = false;
    player.out = false;
    player.gameId = gameId;
    player.socket = socket;
    player.user = user;
    player.pickReady = false;
    player.hero = null
    player.setHero = setHero

    return player;

    function setHero(hero){
        player.hero = hero
    }
}

exports.Player = Player