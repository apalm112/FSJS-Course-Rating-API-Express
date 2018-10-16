'use strict';

/* Custom Middleware to check for Header Authentiation **************/
const auth = require('basic-auth');
const User = require('../database/models').User;

exports.credentials = function(req, res, next) {
	// Checks to for empty email/password input values, throws error if true.
	var getAuthorization = auth(req);
	// Get the user's email, (name = email), & password from the headers.
	if (getAuthorization.name && getAuthorization.pass) {
		res.locals.getAuthorization = getAuthorization;
		return next();
	} else {
		var error = new Error('Email and password are required from custom middleware.');
	// Set res.statusCode for unit testing.
		error.status = res.statusCode = 401;
		return next(error);
	}
};

exports.callAuthen = function(req, res, next) {
	// Passes email/password values onto the UserSchema.statics.authenticate() method.
	var getAuthorization = auth(req);
// Calls the User Schema static method to authenticate the user.
	User.authenticate(getAuthorization, function(error, user) {
		if ( !user ) {
			error.status = res.statusCode = 401;
			return next(error);
		} else {
			res.locals.user = user.id;
			req.body.user = user;
			return next();
		}
	});
};
