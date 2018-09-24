'use strict';
// require modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const objectID = require('mongodb').ObjectID;
const auth = require('basic-auth');

// require database models
const User = require('../database/models').User;
const Course = require('../database/models').Course;
const Review = require('../database/models').Review;

// require custom middleware function
const middle = require('./middleware');

/* User Routes *******************************************************/
// TODO:  Returns the currently authenticated user, ?UNIT TESTS?
router.get('/users', middle.credentials, (req, res, next) => {
	// When a User makes a request to the `GET /api/users` route with the correct credentials, the corresponding user document is returned.
	// console.log(req.body.user);
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
});

// POST new individual user.  This works IF the data passed in is in this format:
/*  {
			 "fullName": "Bob Jones",
			 "emailAddress": "bob@aol.com",
			 "password": "pass"
}
 It Must have the '"__v": 0' in order to Work Correctly!		*/
// DONE: Creates a user, sets the Location header to "/", and returns no content!
router.post('/users', (req, res, next) => {
	var user = new User(req.body);
	user.save(function(error, users) {
		if(error) return next(error);
		res.redirect('/');
		res.status(201);
	});
});


/* Courses Routes *******************************************************/
router.param('coursesId',(req, res, next, id) => {
	// TODO: Fix the position of the reviews array in the return format.  It is listed above the course data, which is incorrect.
	// Param route uses mongodb navtive method to validate the ObjectId, sauce: https://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
	// console.log(objectID.isValid(id));
	if ( !objectID.isValid(id) ) {
		var error = new Error('Course ID is a Invalid Format!!');
		error.status = 404;
		return next(error);
	} else {
// IDEA: Avoid exporting/requiring models — if any have refs to other models this can lead to a dependency nightmare. Use var User = mongoose.model('user') instead of require.  Sauce: https://stackoverflow.com/a/19051909/6495470
		// TODO: See https://stackoverflow.com/a/52043244/6495470 for possible population solution.
		Course
			.findById(id)
			.populate( 'user', 'fullName' )
			.populate({ path: 'reviews', populate: { path: 'user', select: 'fullName' }})
			.exec(function(error, course) {
			// console.log(course.reviews, course.user);
				if(error) return next(error);
				if(!course) {
					var error = new Error('api Course ID Not Found!');
					error.status = 404;
					return next(error);
				}
				console.log(course);
				req.course = course;
				return next();
			});	// end findById()
	}  // end else
});	// end param()

// GET all Courses
// DONE: Returns Only the Course "_id" & "title" properties.
router.get('/courses', (req, res, next) => {
	Course.find({}, '_id title')
		.exec(function(error, courses) {
			if(error) return next(error);
			// console.log(req);
			res.json(courses);
		});
});

// GET individual Course by _id & return all Course properties and related documents for the provided course ID.
// TODO:  ONE: 	add the missing data for this route.  Return all related User and Review Documents!
// TODO: TWO:
// 							When returning a single course for the GET /api/courses/:courseId route, use Mongoose deep population to return only the fullName of the related user on the course model and each review returned with the course model. This will hide other user’s private details, like passwords and emails, from other users.
// Example user object returned: { "_id": "wiubfh3eiu23rh89hcwib", "fullName": "Sam Smith" } * See the Project Resources section for more information about deep population.
// Using deep population, only the user’s id and fullName are returned for the user and reviews.user properties on the GET /api/courses/:courseId route
router.get('/courses/:coursesId', (req, res) => {
	// Uses the 'route.params()' up above.
	res.json(req.course);
});

// DONE: POST new individual Course. Creates a course, sets the Location header, and returns no content
router.post('/courses', middle.credentials, (req, res, next) => {
	// console.log(req.body);
	var course = new Course(req.body);
	course.save(function(error, course) {
		if(error) return next(error);
		res.redirect('/');	// Sets the location header.
		res.status(201);
	});
});

// DONE: Updates a course and returns no content PUT individual Course by _id.
router.put('/courses/:coursesId', middle.credentials, (req, res, next) => {
	// Course.findById(req.params.id)
// console.log(req.course);
// Deprecation Warning: Use updateOne() instead.
	req.course.update(req.body, function(error, courses) {
		if(error) return next(error);
		res.redirect('/');	// Sets the location header.
		res.status(204);	// Is returning 302
	});
});

router.param('reviews', (req, res, next, id) => {
	// This param route validates the incoming user _id.  Invalid ones get an error message, while valide ones are allowed to continue onto the next middleware.
	// Param route uses mongodb navtive method to validate the ObjectId, sauce: https://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
	// console.log(objectID.isValid(id));
	// Waht Form Does It Need To Be In!!!?? This One:  "user": "5b9d0511872b393751dc00c9"
	// First capture the userId in the new review from inside the req.body object.
	var ufo = req.body.user;
	// console.log('====ufo=====typeof============>', ufo, (typeof ufo) );
	// console.log('objectID is Valid:', objectID.isValid(ufo));
	if ( !objectID.isValid(ufo) ) {
		var error = new Error('USER ID is a Invalid Format!! router.param(reviews) line 144 ');
		error.status = 404;
		return next(error);
	} else {
		return next();
	}
});

// POST new individual Review. DONE: Creates a review for the specified course ID, sets the Location header to the related course, and returns no content.
// // TODO: TWO: A User can use a correct pair of email & password to POST a new Review WHILE using a different user: ObjectId than the one that matches to the given email/password combo.
router.post('/courses/:coursesId/:reviews', middle.credentials, (req, res, next) => {
	// Put the userId into a variable in order to pass it into the static methon on the Course Model.
	// DONE: ONE: Fix this static method call so it can work for the Review Model instead of the Course Model.

	var userIDObject = req.course.user;
	var userIdString = (JSON.stringify(userIDObject)).slice(8, 32);
	var courseUserId = userIdString;
	var courseBeingPostedToId = req.course.id;
	var postReviewUserId = req.body.user.id;
	let potato = req.body.user;
	// console.log('==========================', courseUserId);
	// console.log('courseUserId', courseUserId, 'courseBeingPostedToId', courseBeingPostedToId, 'postReviewUserId', postReviewUserId);

	var review = new Review(req.body);

	review.validateReview(courseUserId, postReviewUserId, function(error) {
		if(error) {
			return next(error);
		} else {
			// Sauce:  https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
			req.course.reviews.push(postReviewUserId);
			req.course.save(req.course);
			review.save(function(error, reviews) {
				if(error) return next(error);
				res.redirect('/api/courses/' + courseBeingPostedToId);
				res.status(201);
			});
		}
	});
});
/* End Routes *****************************************************/
module.exports = router;
