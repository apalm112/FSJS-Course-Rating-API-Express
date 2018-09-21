'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

const validator = function(val){
	// Checks email for correct format, regex sauce:  https://stackoverflow.com/questions/18022365/mongoose-validate-email-syntax
	console.log(val);
	// From Treehouse Link, Sauce:  http://emailregex.com/
	//   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	var checkEmail = val.match((/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/));
	if (checkEmail !== null) {
		return true;
	} else if (!checkEmail) {
		return false;
	}
};

//	TODO:  install mongoose-unique-validator to cover duplicate user entries.
//	 emailAddress (String, required, must be unique and in correct format)
var UserSchema = new Schema({
	// _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	fullName: 		 { type: String, required: true, trim: true },
	emailAddress: { type: String,  required: true,  validate: validator },
	password:		 { type: String, required: true }
});

var ReviewSchema = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },	// Reference to User Document.
	postedOn: { type: Date, default: Date.now  },
	rating: { type: Number, min: 1, max: 5 },
	review: String
});

var CourseSchema = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },		// ObjectID1('AAAA') Reference to User Document.
	title:  { type: String, required: true },
	description: { type: String, required: true },
	estimatedTime: String,
	materialsNeeded: String,
	steps:	[{
		stepNumber: { type: Number },
		title: { type: String, required: true },
		description: { type: String, required: true }
	}],
	reviews: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Review' } ]
	//[ ObjectID1('AAAA'), ObjectID2('AAAA2') ]		// Reference to Review Documents.
	//	reviews: [ { review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' } } ]
});

// DONE: An "authenticate" static method on the user schema: -- which compares a password to the hashed password stored on a user document instance.
UserSchema.statics.authenticate = function(email, password, callback) {
	User.findOne({ emailAddress: email })
		.exec(function(error, user) {
			if ( !user ) {
				error = new Error('Invalid Email address entered.');
				error.status = 401;
				return callback(error);
			} else {
				bcrypt.compare(password, user.password, function(error, result) {
					if (result === true) {
						console.log('password hash matched');
						return callback(null, user);
					} else {
						console.log('pasword hash NO match');
						error = new Error('Invalid password entered.');
						error.status = 401;
						return callback(error);
					}
				});
			}
		});
};


/* Mongoose Pre-Hook:   is a type of middleware.  A pre save hook on the user schema that uses the bcrypt npm package encrypts the password property before saving it to the database */
UserSchema.pre('save', function(next) {
		/*
				Due to the nature of this in an arrow function you can't use them for Mongoose hooks. this in arrow functions aren't rebindable, but Mongoose wants to rebind this to be the document being saved. You should use an anonymous function instead (i.e., function() {})
				`.pre()` is Mongoose hook.
				The data assigned to `this` in Mongoose's pre save hook function is the data that Mongoose will write to MongoDB.
		 */
	// Hash sauce:  https://github.com/kelektiv/node.bcrypt.js
	const saltRounds = 10;
	var user = this;
	console.log(user);
	// only hash the password if it has been modified or is new.
	if (!user.isModified('password')) return next();
	bcrypt.hash(user.password, saltRounds, function(error, hash) {
		if(error) return next(error);
		user.password = hash;
		next();
	});
});

// Validation to prevent a user from reviewing their own course.  Which gets run when a new review is about to be inserted into the Review Collection. The `router.params` route gets the courseId, pass that into a method call to here, process it & then send it back.
ReviewSchema.method('validateReview', function(var1, var2, var3, callback) {
	var review = this;
	var userIDObject = var1;
	var userIdString = (JSON.stringify(userIDObject)).slice(1, 25);
	var actualCourseUserId = userIdString;
	// console.log('actualCourseUserId and typeof:', actualCourseUserId, (typeof actualCourseUserId));// is an Object!
	// Its getting Double quotes around it in the Node Debugger!
	// get the :courseId from req.params & store it in a variable.
	var courseBeingPostedToId = var2;
	// get the usersId from the req.body
	var reviewBeingPostedByUserId = var3;
	// console.log('reviewBeingPostedByUserId and typeof:', reviewBeingPostedByUserId, (typeof reviewBeingPostedByUserId));
		console.log(( actualCourseUserId === reviewBeingPostedByUserId ));
		// This calls next() if the user is not posting a review to their own course.
	if ( !(actualCourseUserId === reviewBeingPostedByUserId) ) {
		callback();
	} else {
		let error = new Error('User not allowed to post review on your own course.');
		error.status = 401;
		callback(error);
	}
});

var User = mongoose.model('User', UserSchema);
var Review = mongoose.model('Review', ReviewSchema);
var Course = mongoose.model('Course', CourseSchema);

module.exports.User = User;
module.exports.Review = Review;
module.exports.Course = Course;
