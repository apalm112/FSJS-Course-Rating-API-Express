'use strict';

/* My Custon Middleware for Project 11 to check for Header Authentiation **************/
const auth = require('basic-auth');
var User = require('../database/models').User;

function credentials(req, res, next) {
	// TODO: potential fix, password Authorization is not working on 'get /users' route.
	var getAuthorization = auth(req);
	console.log(getAuthorization);
	if (getAuthorization.name && getAuthorization.pass) {
		User.authenticate(getAuthorization.name, getAuthorization.pass, function(error, user) {
			// console.log('line 42', user);
			if ( !user ) {
				return next(error);
			} else if ( error ) {
				var error = new Error('Wrong email or password from custom middleware!');
				error.status = 401;
				return next(error)
			} else {
				// console.log('line 48', user); 
				// req.session.userId = user._id;
				// Redirects to the Users profile.
				// res.redirect('/api/users/' + user._id );
				// console.log(user);
				res.locals.user = user.id;
				req.body.user = user;
				console.log(req.body.user);
				next();
			}
		});
	} else {
		// console.log(getAuthorization, getAuthorization.pass);
		var error = new Error('Email and password are required from custom middleware.');
		error.status = 401;
		return next(error);
	}
}

module.exports.credentials = credentials;
