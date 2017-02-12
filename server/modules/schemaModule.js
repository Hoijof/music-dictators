// mongoose module, mongodb pligin
var mongoose = require('mongoose');

// config module
var config = require('../config');

//bcrypt module, encriptation pligin
var bcrypt = require('bcrypt');

// connect database
mongoose.connect(config.MONGO_URI);

// user schema
var userSchema = new mongoose.Schema({
	email : {
		type : String,
		unique : true,
		lowercase : true
	},
	password : {
		type : String,
		select : false
	},
	userName : String,
	img : {
		type : String,
		'default' : 'img/default.png'
	},
	connected : {
		type : Boolean,
		'default' : false
	},
	lastConnection : Date,
	ideology: {
		type: String,
		default: 'capitalist',
		required: true
	}
});

// user schema pre operation, encript password
userSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) {
		return next();
	} else {
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(user.password, salt, function(err, hash) {
				user.password = hash;
				next();
			});
		});
	}
});

// user schema password authentication function
userSchema.methods.comparePassword = function(password, done) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		done(err, isMatch);
	});
};

// message schema
var messageSchema = new mongoose.Schema({
	from : String,
	to : String,
	message : String,
	time : Date,
	readed : Boolean
});

// game schema
var gameSchema = new mongoose.Schema({
	player1 : {
		id : mongoose.Schema.Types.ObjectId,
		wordsTyped : Number,
		correctWords : Number,
		incorrectWords : Number,
		unitsCreated : Number,
		unitsKilled : Number,
		specials : Number,
		score : Number,
		win : Boolean
	},
	player2 : {
		id : mongoose.Schema.Types.ObjectId,
		wordsTyped : Number,
		correctWords : Number,
		incorrectWords : Number,
		unitsCreated : Number,
		unitsKilled : Number,
		specials : Number,
		score : Number,
		win : Boolean
	},
	st : String,
	date : Date,
	duration : Number
});

// export schemas
exports.User = mongoose.model('User', userSchema);
exports.Message = mongoose.model('Message', messageSchema);
exports.Game = mongoose.model('Game', gameSchema);