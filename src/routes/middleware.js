'use strict';

/* Custom middleware for Project 11 to check for Header Authentiation **************/
const auth = require('basic-auth');
var User = require('../database/models').User;

function credentials(req, res, next) {
	// TODO: potential fix, password Authorization is not working on 'get /users' route.
	var getAuth = auth(req);
	// console.log(getAuth);
	if (getAuth.name && getAuth.pass) {
		User.authenticate(getAuth.name, getAuth.pass, function(error, user) {
			if ( !user ) {
				return next(error);
			} else if (error) {
				var error = new Error('Error message from custom middleware, figure it out...');
				error.status = 401;
				return next(error);
			} else {
				res.locals.user = user.id;
				req.body.user = user;
				next();
			}
		});
	} else {
		// If either email or password field is left blank, this error message is shown.
		var error = new Error('You must enter Email and password. From custom middleware.');
		error.status = 401;
		return next(error);
	}
}

module.exports.credentials = credentials;
