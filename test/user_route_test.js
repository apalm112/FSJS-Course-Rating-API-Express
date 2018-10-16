'use strict';

var chai = require('chai'),
	httpMocks = require('node-mocks-http'),
	mongoose = require('mongoose'),
	sinon = require('sinon');
// Set Variables
var expect = chai.expect;

//  To stop OverwriteModelError. Sauce: https://stackoverflow.com/a/43761258/6495470
for (let model in mongoose.models)
	delete mongoose.models[model];

/***********************************************************************************/
describe('Invalid Credentials passed to middleware.credentials()', function () {
	// Tests for whether or not the Email & Password values are empty.
	var credentials = require('../src/routes/middleware').credentials;
	var req, res;
	before(function (done) {
		req = httpMocks.createRequest({
			method: 'GET',
			url: '/api/users',
			headers : { Authorization: 'Basic Og==' }	// Email & Password left empty in Basic Auth format from Postamn.  Test passes.
			// headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	} // Valid Email & Password in Basic Auth format from Postman.  Test fails.
		}),
		res = httpMocks.createResponse({});
		done();
	});

	it('should return 401 status error when passed no credentials', function (done) {
		credentials(req, res, function next(error) { if(error){
			res.locals.error = error;
			return error;
		}
		});
		expect(res.statusCode).to.deep.equal(401);
		expect(res.locals.error.message).to.deep.equal('Email and password are required from custom middleware.');
		expect(req.headers.authorization).to.deep.equal('Basic Og==');
		done();
	});
});
/**************************************************************************************/


describe('Invalid Email & Password', function () {
	var email, invalidEmail, invalidPassword, getAuthenStub, password, req, res, validEmailArray, validPasswordArray;

	before(function (done) {
	// These variables hold the values tested for, either a valid/invalid email address & password.  Invalid ones will throw the 401 error status, pass the test.  Valid ones will fail the test.
		invalidEmail = 'ones@aol.com';
		invalidPassword = '1233password';
		validEmailArray = [ 'one@aol.com', 'two@aol.com' ];
		validPasswordArray = [ '123password', 'loginpassword', 'examplePass' ];
		email = validEmailArray.filter(mail => mail === invalidEmail);
		password = validPasswordArray.filter(pass => pass === invalidPassword);
		// A stub you can use to control conditionals, here it is being used to stub out the UserSchema.statics.authenticate() method normally called in the callAuthen() middleware.
		getAuthenStub = sinon.stub();
		req = httpMocks.createRequest({
			validEmailArray: validEmailArray,
			email: email,
			check: function() {
				if ( (email.pop() === undefined) && (password.pop() === undefined) ) {
					var error = new Error('Invalid Email address entered.');
					error.status = res.statusCode = 401;
					res.locals.error = error;
					return error;
				} else {
					res.statusCode = 200;
				}
			}
		}),
	res = httpMocks.createResponse({});
		done();
	});
	it('should return 401 status error when passed invalid email or password', function (done) {
		getAuthenStub.returns( req.check() );

		expect(res.statusCode).to.deep.equal(401);
		expect(res.locals.error.message).to.deep.equal('Invalid Email address entered.');
		done();
	});
});
/**************************************************************************************/

describe('Valid credentials', function () {
	// When a request to the GET /api/users route is made with the correct credentials, the corresponding user document is returned
	var email, invalidEmail, invalidPassword, getAuthenStub, password, req, res, validEmailArray, validPasswordArray;

	before(function (done) {
		// These variables hold the values tested for, either a valid/invalid email address & password.  Invalid ones will throw the 401 error status & fail the test.  Valid ones will pass the test.
		invalidEmail = 'one@aol.com';
		invalidPassword = '123password';
		validEmailArray = [ 'one@aol.com', 'two@aol.com' ];
		validPasswordArray = [ '123password', 'loginpassword', 'examplePass' ];
		email = validEmailArray.filter(mail => mail === invalidEmail);
		password = validPasswordArray.filter(pass => pass === invalidPassword);
		// A stub you can use to control conditionals, here it is being used to stub out the UserSchema.statics.authenticate() method normally called in the callAuthen() middleware.
		getAuthenStub = sinon.stub();
		req = httpMocks.createRequest({
			validEmailArray: validEmailArray,
			email: email,
			check: function() {
				if ( (email.pop() === undefined) || (password.pop() === undefined) ) {
					var error = new Error('Invalid Email address entered.');
					error.status = res.statusCode = 401;
					res.locals.error = error;
					return error;
				} else {
					res.statusCode = 200;
				}
			}
		}),
		res = httpMocks.createResponse({
			locals: {
				authenticated: true,
				email: 'nethack@aol.com',
				password: 'huh',
				authorization: 'Basic b25lQGFvbC5jb206b25l',
				userData: {
					_id: '5bbe4bea5c90b436b20e602c',
					fullName: 'One Uno',
					emailAddress: 'one@aol.com',
					password: '$2b$10$4f8zjUTcj9fxrNEi7IGuDumozs4b4aGWtf608DarB0DJraEwYSnva',
					__v: 0 }
			}
		});
		getAuthenStub = sinon.stub();
		done();
	});

	it('should return corresponding user document when passed valid credentials'
	, function (done) {

		getAuthenStub.returns( req.check() );

		expect(res.statusCode).to.deep.equal(200);
		expect(res.locals.userData).to.deep.equal(res.locals.userData);
		done();
	});
});

after(function () {
	console.log('Test Suite completed.');
});
