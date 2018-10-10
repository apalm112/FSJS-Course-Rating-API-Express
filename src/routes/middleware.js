'use strict';

/* Custom Middleware to check for Header Authentiation **************/
const auth = require('basic-auth');
var User = require('../database/models').User;

function credentials(req, res, next) {
	var getAuthorization = auth(req);
	// Get the user's email & password from the headers.
	if (!getAuthorization.name || !getAuthorization.pass) {
		var error = new Error('Email and password are required from custom middleware.');
		error.status = 401;
		return next(error);
	} else {
	// Calls the User Schema static method to authenticate the user.
		User.authenticate(getAuthorization, function(error, user) {
			if ( !user ) {
				return next(error);
			} else {
				res.locals.user = user.id;
				req.body.user = user;
				next();
			}
		});
	}
}

module.exports.credentials = credentials;
