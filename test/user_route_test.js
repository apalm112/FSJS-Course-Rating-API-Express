'use strict';
/*
 TODO: Tests have been written for the following user story:

		1)	When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned

		2)	When I make a request to the GET /api/users route with invalid credentials, a 401 status error is returned

		Using the actual req and res objects that come from Express would fall more under integration tests. Unit test focus solely on your code and all other external dependencies should be mocked.

 */
// Require modules
var auth = require('basic-auth'),
	chai = require('chai'),
	express = require('express'),
	httpMocks = require('node-mocks-http'),
	mongoose = require('mongoose'),
	proxyquire = require('proxyquire'),	// .noCallThru()
	sinon = require('sinon'),
	supertest = require('supertest');
// Set Variables
var expect = chai.expect;
var getUser = {
		"_id": ("5bbe4bea5c90b436b20e602c"),
		"fullName": "One Uno",
		"emailAddress": "one@aol.com",
		"password": "$2b$10$4f8zjUTcj9fxrNEi7IGuDumozs4b4aGWtf608DarB0DJraEwYSnva",
		"__v": 0
}
// Test Suite:  https://stackoverflow.com/a/34517121/6495470
describe('GET /api/users Route Test Suite', function () {
	// Require Custom Middleware
	var middleware = require('../src/routes/middleware');
	console.log('Custom Middleware:\n', middleware);
	var req, res, error;

	/* To stop OverwriteModelError. Sauce: https://stackoverflow.com/a/43761258/6495470 */
	for (let model in mongoose.models)
	delete mongoose.models[model];
	/* End of code block */

	describe('Invalid Credentials', function () {

		describe('Test middleware.credentials:', function () {
			before(function (done) {
				req = httpMocks.createRequest({
					method: 'GET',
					url: '/api/users',
					headers : { Authorization: 'Basic Og==' }	// Email & Password left empty
					// headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	} // Good Creds
				}),
				res = httpMocks.createResponse({
					locals: {
						anyKey: 'any Value here',
						authenticated: false,
						Authorization: 'Basic Og=='
					}
				});
				done();
			});

			it('should return 401 status error when passed no credentials', function (done) {
				middleware.credentials(req, res, function next(error) {
					if(error) {	res.statusCode = error.status; }
				});
				expect(res.statusCode).to.deep.equal(401);
				done();
			}); // End it('should return 401 when passed no credentials')
		});  // End describe('Test middleware.credentials:')

		describe('Test middleware.callAuthen:', function () {
			before(function (done) {
				req = httpMocks.createRequest({
					method: 'GET',
					url: '/users',
					headers : { authorization: 'Basic b25lQGFvbC5jb21zOm9uZQ==' } // Bad Creds
					// headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	} // Good Creds
				}),
				res = httpMocks.createResponse({
					locals: {
						anyKey: 'any Value here',
						authenticated: false,
						authorization: 'Basic b25lQGFvbC5jb21zOm9uZQ=='
						//  	authorization: 'Basic b25lQGFvbC5jb206b25l'
					}
				});
				done();
			});
			xit('should return 401 status error when passed invalid credentials', function (done) {

				middleware.credentials(req, res, function next() {
					// var error = new Error('Invalid Email address entered.');
					if (res.locals.authorization ===  'Basic b25lQGFvbC5jb21zOm9uZQ==') {
						res.status(401);
					} else {
						res.status(200);
					}
					// if(error)	return error;
				});
				middleware.callAuthen(req, res, function next(error) {
					if(error) return error;
				});
				middleware.result(req, res);
				// console.log(res);
				// console.log('RES.STATUSCODE:------------------>', res.statusCode);
				expect(res.statusCode).to.deep.equal(401);
				done();
			}); // End it('should return 401')
		});	// End describe('Test middleware.callAuthen')
	});	// End describe('Invalid Credentials')








	describe('Valid Credentials', function () {
		// TODO: 		1)	When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
		before(function (done) {
			req = httpMocks.createRequest({
				method: 'GET',
				url: '/users',
				headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	},
				body: {
					user: getUser
				}
			}),
			res = httpMocks.createResponse({
				locals: {
					authenticated: true,
					email: 'nethack@aol.com',
					password: 'huh',
					authorization: 'Basic b25lQGFvbC5jb206b25l'
				}
			});
			done();
		});
		describe('Test middleware.callAuthen:', function () {
		//a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
			xit('should return corresponding user document when passed valid credentials'
			, function (done) {

				middleware.credentials(req, res, function next(error) {
					/*if (res.locals.authorization ===  'Basic b25lQGFvbC5jb206b25l') {
						res.status(200).json(req.body.user);
					} else {
						res.status(404);
					}*/
				});
				middleware.callAuthen(req, res, function next(error) {
					if(error) return error;
				});
				middleware.result(req, res);
				// console.log(res);
				// console.log('RES.STATUSCODE:------------------>', res.statusCode);
				expect(res.statusCode).to.deep.equal(200);
				expect(req.body.user).to.deep.equal(getUser);
				done();
				console.log(res.statusCode, res.statusMessage, res.locals);
			});	// End it('should return user doc')
		});
	});	// End describe('Valid Credentials')

});	// End describe('User Route Test Suite') Suite


/* START SAMPLE TEST CODE: ********************************************/
// Sauce: https://teamtreehouse.com/library/mocks-and-stubs
// A new Test Suite:
/*describe('Name_of_function_to_test', function () {

	// At the top of the suite import the function which will be tested.
	var Name_of_function_to_test = require('../src/routes/middleware').credentials;

	// Create variables if you need them for testing, these can be functions too.
	var thing;

	// Hook to set up preconditions.
	beforeEach(function () {
		// Here you can set pretend functions that don't do real app logic.  They just return the values that you would expect the real working functions to produce.  SET UP THE RETURN VALUES TO BE ULTIMATELY WHAT YOU EXPECT THE FUNCTION TO RETURN WHEN THE APP IS COMPLETE.
		// CUSTOM STUB:
	 	thing = function () { return [ 401 ] };
	// ^--now, no matter how you write `thing()` in the future, this test ensures that 'Name_of_function_to_test' does what you expect with the return value. This is your custom stub!
	});

	// Start of Spec.
	it('should return false or whatever you want here', function () {
		// Make the `expect` to 'return false or whatever you want here.'
		var result = Name_of_function_to_test(thing);
		expect(result).to.be.false;
	});	// End of Spec.
	// ^--So now even though there is No working `thing()` function, you've set up the spec to pretend that those parts of the your code already work. That's the only important information this test needs.
	// This test Spec will use your stub version of the `thing()` function.

	});*/ // End of Test Suite.
// Next Step:  write the actual function & export it for testing.
/* END SAMPLE TEST CODE ***********************************************/
after(function () {
	console.log('Test Suite completed.');
});
