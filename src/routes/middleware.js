'use strict';

/* My Custon Middleware for Project 11 to check for Header Authentiation **************/
const auth = require('basic-auth');
var User = require('../database/models').User;

function credentials(req, res, next) {
	var getAuthorization = auth(req);
// Conditional to get unit test for 401 error to pass.
	// if(getAuthorization === undefined){
	// 	res.status(401);
	// 	return next(error);
	// }
	if (!getAuthorization.name || !getAuthorization.pass) {
		var error = new Error('Email and password are required from custom middleware.');
		error.status = 401;
		return next(error);
	} else {
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
