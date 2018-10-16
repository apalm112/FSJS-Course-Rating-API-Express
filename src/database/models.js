'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	uniqueValidator = require('mongoose-unique-validator'),
	bcrypt = require('bcrypt');

const validator = function(val){
	// Check email to be a valid address.  From Treehouse Link, Sauce:  http://emailregex.com/
	var checkEmail = val.match( (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) );
	if (checkEmail !== null) {
		return true;
	} else if (!checkEmail) {
		return false;
	}
};

var UserSchema = new Schema({
	fullName: 		 { type: String, required: true, trim: true },
	emailAddress: { type: String,  required: true, validate: validator, unique: true },
	password:		 { type: String, required: true }
});
// Checks that email address is unique.
UserSchema.plugin(uniqueValidator);

var ReviewSchema = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },	// Reference to User Document.
	postedOn: { type: Date, default: Date.now  },
	rating: { type: Number, min: 1, max: 5 },
	review: String
});

var CourseSchema = new Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },		// Reference to User Document.
	title:  { type: String, required: true },
	description: { type: String, required: true },
	estimatedTime: String,
	materialsNeeded: String,
	steps:	[{
		stepNumber: { type: Number },
		title: { type: String, required: true },
		description: { type: String, required: true }
	}],
	reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

// An "authenticate" static method on the user schema: -- which compares a password to the hashed password stored on a user document instance.
UserSchema.statics.authenticate = function(creds, callback) {
	User.findOne({ emailAddress: creds.name })
		.exec(function(error, user) {
			if(error) {
				return callback(error);
			} else if ( !user ) {
				var error = new Error('Invalid Email address entered.');
				error.status = 401;
				return callback(error);
			} else {
				bcrypt.compare(creds.pass, user.password, function(error, result) {
					if (result === true) {
						return callback(null, user);
					} else {
						var error = new Error('Invalid password entered.');
						error.status = 401;
						return callback(error);
					}
				});
			}
		});
};


/* A pre save hook on the user schema that uses the bcrypt npm package encrypts the password property before saving it to the database */
UserSchema.pre('save', function(next) {
		/*
				Due to the nature of this in an arrow function you can't use them for Mongoose hooks. this in arrow functions aren't rebindable, but Mongoose wants to rebind this to be the document being saved. You should use an anonymous function instead (i.e., function() {})
				`.pre()` is Mongoose hook.
				The data assigned to `this` in Mongoose's pre save hook function is the data that Mongoose will write to MongoDB.
		 */
	const saltRounds = 10;
	var user = this;
	// only hash the password if it has been modified or is new.
	if (!user.isModified('password')) return next();
	bcrypt.hash(user.password, saltRounds, function(error, hash) {
		if(error) return next(error);
		user.password = hash;
		next();
	});
});

// Validation to prevent a user from reviewing their own course.  Runs before a new review is inserted into the Review Collection.
ReviewSchema.method('validateReview', function(var1, var2, callback) {
	var userIDObject = var1;
	var userIdString = (JSON.stringify(userIDObject)).slice(1, 25);
	var courseUserId = userIdString;
	var postReviewUserId = var2;
	// The callback calls next() if the user is not posting a review to their own course.
	if ( (courseUserId === postReviewUserId) ) {
		var error = new Error('User not allowed to post review on your own course.');
		error.status = 401;
		callback(error);
	} else {
		callback();
	}
});


var User = mongoose.model('User', UserSchema);
var Review = mongoose.model('Review', ReviewSchema);
var Course = mongoose.model('Course', CourseSchema);

module.exports.User = User;
module.exports.Review = Review;
module.exports.Course = Course;
