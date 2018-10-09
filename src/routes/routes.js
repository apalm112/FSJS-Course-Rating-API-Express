'use strict';
// require modules
const express = require('express');
const router = express.Router();
const objectID = require('mongodb').ObjectID;

// require database models
const User = require('../database/models').User;
const Review = require('../database/models').Review;
const Course = require('../database/models').Course;

// require custom middleware function
const middle = require('./middleware');

/* User Routes *******************************************************/
router.get('/users', middle.credentials, (req, res) => {
	// When a User makes a request to the `GET /api/users` route with the correct credentials, the corresponding user document is returned.
	// TODO: Slack channel sez All seed data passwords MUST be Hashed!
	//  * So fix that I guess...
	res.json(req.body.user);
});

// POST new individual user.  This works IF the data passed in is in this format:
/*  {
			 "fullName": "Bob Jones",
			 "emailAddress": "bob@aol.com",
			 "password": "pass"
} 	*/
// Creates a user, sets the Location header to "/", and returns no content.
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
	// Checks the URI courseId format, finds the course document, populates the refs in it & returns it.
	// Param route uses mongodb navtive method to validate the ObjectId, sauce: https://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
	if ( !objectID.isValid(id) ) {
		var error = new Error('Course ID is a Invalid Format!!');
		error.status = 404;
		return next(error);
	} else {
		Course
			.findById(id)
			.populate( 'user', 'fullName' )
			.populate({ path: 'reviews', populate: { path: 'user', select: 'fullName' }})
			// .populate({ path: 'reviews', model: 'Course', select: 'fullName' })
			.exec(function(error, course) {
				if(error) return next(error);
				if(!course) {
					var error = new Error('api Course ID Not Found!');
					error.status = 404;
					return next(error);
				}
				req.course = course;
				return next();
			});
	}
});

// GET all Courses, returns only the Course "_id" & "title" properties.
router.get('/courses', (req, res) => {
	Course.find({}, '_id title')
		.exec(function(error, courses) {
			res.json(courses);
		});
});

// GET individual Course by _id & return all Course properties and related documents for the provided courseId.
// Using deep population, only the user’s id and fullName are returned for the user and reviews.user properties
router.get('/courses/:coursesId', (req, res) => {
	// Uses the 'route.params()' up above.
	res.json(req.course);
});

// POST new individual Course. Creates a course, sets the Location header, and returns no content
router.post('/courses', middle.credentials, (req, res, next) => {
	var course = new Course(req.body);
	course.save(function(error, course) {
		if(error) return next(error);
		res.redirect('/');	// Sets the location header.
		res.status(201);
	});
});

// Updates a course and returns no content PUT individual Course by _id.
router.put('/courses/:coursesId', middle.credentials, (req, res, next) => {
	req.course.update(req.body, function(error) {
		if(error) return next(error);
		res.redirect('/');	// Sets the location header.
		res.status(204);
	});
});

router.param('reviews', (req, res, next, id) => {
	// This param route validates the incoming user _id.  Invalid ones get an error message, while valid ones are allowed to continue onto the next middleware.  Param route uses mongodb navtive method to validate the ObjectId, sauce: https://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
	// First capture the userId in the new review from inside the req.body object.
	var getId = req.body.user;
	/* Must be in format:
		{
	    "user": "5ba97554b7116463fd924849",
	    "rating": 4,
	    "review": "Here is a new review."
		}
	*/
	if ( !objectID.isValid(getId) ) {
		var error = new Error('USER ID is a Invalid Format!! router.param(reviews)');
		error.status = 404;
		return next(error);
	} else {
		return next();
	}
});

router.post('/courses/:coursesId/:reviews', middle.credentials, (req, res, next) => {
	// Put the userId into a variable in order to pass it into the static methon on the Course Model.
	var courseUserId = (JSON.stringify(req.course.user)).slice(8, 32);
	var courseBeingPostedToId = req.course.id;
	var postReviewUserId = req.body.user.id;
	var review = new Review(req.body);

	review.validateReview(courseUserId, postReviewUserId, function(error) {
		if(error) {
			return next(error);
		}

	//  Save new review First
		review.save();
	//  Get that new reviews _id
		var query = Review.where({ user: postReviewUserId });
		query.findOne(function(error) {
			if (error) return error;
			if (review) review.id;
		});
	// Push new reviews _id into the course.review array
		req.course.reviews.push( review.id );
		req.course.save(req.course, function(error) {
			if(error) return next(error);
			res.redirect('/api/courses/' + courseBeingPostedToId);
			res.status(201);
		});
	});
});

module.exports = router;
