module.exports = function(app, User, moment, jwt, config) {

	// token creation
	function createToken(user) {
		var payload = {
			sub : user._id,
			iat : moment().unix(),
			exp : moment().add(1, 'days').unix()
		};
		return jwt.encode(payload, config.TOKEN_SECRET);
	}

	// ensure if user is authenticated
	function ensureAuthenticated(req, res, next) {
		if (!req.headers.authorization) {
			return res.status(401).send({
				message : 'Please make sure your request has an Authorization header'
			});
		}
		var token = req.headers.authorization.split(' ')[1];
		var payload = jwt.decode(token, config.TOKEN_SECRET);
		if (payload.exp <= moment().unix()) {
			return res.status(401).send({
				message : 'Token has expired'
			});
		}
		req.user = payload.sub;
		next();
	}

	// rutas

	// get user data
	app.get('/me', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (err) {
				console.log(err);
			} else {
				res.send(user);
			}
		});
	});

	// update user data
	app.put('/me', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (err) {
				console.log(err);
			} else if (!user) {
				return res.status(400).send({
					message : 'User not found'
				});
			} else {
				user.userName = req.body.userName || user.userName;
				user.email = req.body.email || user.email;
				user.save(function(err) {
					if (err) {
						console.log(err);
					} else {
						res.status(200).end();
					}
				});
			}
		});
	});

	// login
	app.post('/auth/login', function(req, res) {
		User.findOne({
			email : req.body.email
		}, '+password', function(err, user) {
			if (err) {
				console.log(err);
			} else if (!user) {
				return res.status(401).send({
					message : 'Wrong email and/or password'
				});
			} else {
				user.comparePassword(req.body.password, function(err, isMatch) {
					if (err) {
						console.log(err);
					} else if (!isMatch) {
						return res.status(401).send({
							message : 'Wrong email and/or password'
						});
					}
					res.send({
						token : createToken(user)
					});
				});
			}
		});
	});

	// signup
	app.post('/auth/signup', function(req, res) {
		User.findOne({
			email : req.body.email
		}, function(err, user) {
			if (err) {
				console.log(err);
			} else if (user) {
				return res.status(409).send({
					message : 'Email is already taken'
				});
			} else {
				user = new User({
					userName : req.body.userName,
					email : req.body.email,
					password : req.body.password
				});
				user.save(function() {
					res.send({
						token : createToken(user)
					});
				});
			}
		});
	});
};