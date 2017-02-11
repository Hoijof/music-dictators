// path module, path construct helper
var path = require('path');

// body-parser module, prog. lenguages parser
var bodyParser = require('body-parser');

// express module, app construct helper
var express = require('express');

// jwt module, token encriptation
var jwt = require('jwt-simple');

// moment module, time managing helper
var moment = require('moment');

// init app
var app = express();

// init attp server
var http = require('http').Server(app);

// socket.io module, http comunications
var io = require('socket.io')(http);

// config module
var config = require('./config');

// database models
var models = require('./modules/schemaModule');
var User = models.User;
var Message = models.Message;
var Game = models.Game;

// socket manajament module
require('./modules/socketModule')(io, User, Message, Game, moment);

// server config
app.set('port', process.env.port || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(express.static(path.join(__dirname, '../client')));

// rutes manager
require('./modules/routerModule')(app, User, moment, jwt, config, path);

// start server
http.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
