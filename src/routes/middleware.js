'use strict';

/* Custom Middleware to check for Header Authentiation **************/
const auth = require('basic-auth');
const User = require('../database/models').User;

/*exports.credentials = function(req, res, next) {
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
// module.exports.credentials = credentials;
};*/


exports.credentials = function(req, res, next) {
	var getAuthorization = auth(req);
	// Get the user's email, (name = email), & password from the headers.
	if (getAuthorization.name && getAuthorization.pass) {
		return next();
	} else {
		var error = new Error('Email and password are required from custom middleware.');
		error.status = 401;
		return next(error);
	}
};

exports.callAuthen = function(req, res, next) {
	var getAuthorization = auth(req);
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
};

exports.result = function (req, res) {
	res.json(req.body.user);
};


/*exports.credentials = function(req, res) {
	return new Promise(function(resolve, reject) {
		var getAuthorization = auth(req);
		// Get the user's email & password from the headers.
		if (getAuthorization.name || getAuthorization.pass) {
			// Calls the User Schema static method to authenticate the user.
			User.authenticate(getAuthorization, function(error, user) {
				if (user) {
					res.locals.user = user.id;
					req.body.user = user;
					resolve(req.body.user);
				} else {
					var error = new Error('Email and password are required from custom middleware.');
					error.status = 401;
					reject(error);
				}
			});
		}
	});
};
// TODO: Write Unit Test for GET /api/user route:
router.get('/users', (req, res) => {
	middle.credentials(req, res)
		.then(response => res.json(response))
		.catch(error => res.json(error));
});



*/
