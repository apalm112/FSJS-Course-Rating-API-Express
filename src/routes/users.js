'use strict';

/* Functions for User routes */


function getUsers(req, res, next) {
	// When a User makes a request to the `GET /api/users` route with the correct credentials, the corresponding user document is returned.

	console.log(req.body.user);
	var user = req.body.user;
	if (!user) {
		res.status(401).json({
			status: 'not ok',
			data: null
		});
	} else {
		// User.find({})
		// .exec(function(error, users) {
		// 	if(error) return next(error);
		// 	res.json(users);
		// });
		res.status(200).json({
			status: 'ok',
			data: user
		});
	}
}

// POST new individual user.  This works IF the data passed in is in this format:
/*  {
			 "fullName": "Bob Jones",
			 "emailAddress": "bobjr@aol.com",
			 "password": "password",
			 "__v": 0
}
 It Must have the '"__v": 0' in order to Work Correctly!		*/
// DONE: Creates a user, sets the Location header to "/", and returns no content!
function postUser(req, res, next) {
	var user = new User(req.body);
	user.save(function(error, users) {
		if(error) return next(error);
		res.redirect('/');
		res.status(201);
	});

}

module.exports.getUsers = getUsers;
module.exports.postUser = postUser;
