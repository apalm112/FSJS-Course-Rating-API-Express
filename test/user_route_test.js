'use strict';
/*
 TODO: Tests have been written for the following user story:

		1)	When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned

		2)	When I make a request to the GET /api/users route with invalid credentials, a 401 status error is returned

		Using the actual req and res objects that come from Express would fall more under integration tests. Unit test focus solely on your code and all other external dependencies should be mocked.

 */
// Require modules
var chai = require('chai'),
	httpMocks = require('node-mocks-http'),
	mongoose = require('mongoose'),
	testgoose = require('testgoose'),
	proxyquire = require('proxyquire'),	// .noCallThru()
	sinon = require('sinon'),
	express = require('express'),
	supertest = require('supertest');
// Set Variables
var expect = chai.expect;

// Test Suite:  https://stackoverflow.com/a/34517121/6495470

	/* To stop OverwriteModelError. Sauce: https://stackoverflow.com/a/43761258/6495470 */
	for (let model in mongoose.models)
		delete mongoose.models[model];
	/* End of code block */


	/**************************************************************************************	THIS TEST WORKS */
		describe('Invalid Credentials passed to middleware.credentials()', function () {
			var credentials = require('../src/routes/middleware').credentials;
			var req, res;
			before(function (done) {
				req = httpMocks.createRequest({
					method: 'GET',
					url: '/api/users',
					headers : { Authorization: 'Basic Og==' }	// Email & Password left empty in Basic Auth format from Postamn.
					// headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	} // Valid Email & Password in Basic Auth format from Postman.
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
			}); // End it('should return 401 when passed no credentials')
		});  // End describe('Test middleware.credentials:')
	/**************************************************************************************/


describe('Invalid Credentials:  Test middleware.callAuthen:', function () {
	var callAuthen = require('../src/routes/middleware').callAuthen;
	var app, getAuthenStub, request, route, user, req, res;

	before(function (done) {
		// A stub you can use to control conditionals
		getAuthenStub = sinon.stub();
		// Create an Express application object
		app = express();
		// Get the router module w/ stubbed out dependency, stub this out so you can control the results returned by the middleware module to ensure you execute all paths in your code
		route = proxyquire('../src/routes/routes', {
			'../database/models': { authenticate: getAuthenStub }
		});
		// Bind a route to the application.
		route(app);
		// Get a supertest instance so you can make a request agains an express object.
		request = supertest(app);

		req = httpMocks.createRequest({
			method: 'GET',
			url: '/users',
			user: user,
			headers : { authorization: 'Basic b25lQGFvbC5jb21zOm9uZQ==' } // Invalid Creds
			// headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	} // Valid Creds
		}),
		res = httpMocks.createResponse({
			locals: {
				statusCode: 401,
				getAuthorization: {
					name: 'One Uno',
					pass: 'one'
				},
				authorization: 'Basic b25lQGFvbC5jb21zOm9uZQ=='	// Invalid Email Address
				// authorization: 'Basic b25lQGFvbC5jb206b25l'	// Valid Email Address
			}
		});
		done();
	});
	it('should return 401 status error when passed invalid email address', function (done) {
		callAuthen(req, res, function next() { });

		var userData = {
			user: {
				emailAddress: 'one@aol.comgalaticSpaceUFO',
				password: 'password'
			}};
		var error = new Error('Invalid Email address entered.');
		// THIS VALUE IS PART CONTROLLING THE TEST RESULT!
		error.status = res.statusCode = 401;

		// TODO: If I can get the req.body data to show up like the example unit test on the left does
		// (sofa_king/sandbox/Learning_Project_11/unit_testing/express_testing_example),
		//  then I should be able to compare the emails & throw a 401
		// It looks like this effort will require altering the routes.js get('/user') route in order to access the req.body data.
		// Then can return the two different errors thrown by User.authenticate()
		// NOTE: Update!!!  So now this describe unit test has both the httpMocks code & the evanshortiss code working together!
		// logs from inside callAuthen are displaying
		// User.authenticate appears to be successfully stubbed out
		// Am able to control the outcome of the test to get a 401 error
		// CODE STILL RUNS IN POSTMAN
		// Looks like this will work...
		// Need to add code for the getAuthenStub to take place of the User.authenticate() function.  Just need it to return errors.
		getAuthenStub.returns(error);

		// This whole request object IS NOT working, returns Nothing.
		request
			.get('/users/nodejs')
			.expect('Content-Type', /json/)
			.expect(401, function (req, res) {
				console.log(res.body);
				expect(res.body).to.deep.equal({
					data: userData
				});
				expect(res.status).to.deep.equal(401);
			});

		console.log('RES.STATUSCODE:------------------>', res.statusCode);
		console.log(error.message, error.status, req.body);
		expect(res.locals.statusCode).to.deep.equal(401);//from httpMocks.res.locals
		// THIS VALUE IS PART CONTROLLING THE TEST RESULT!
		expect(res.statusCode).to.deep.equal(401);
		expect(error.status).to.deep.equal(401);// does the same as above
		done();
	}); // End it('should return 401')
	it('should return 401 status error when passed invalid password');
});	// End describe('Test middleware.callAuthen')










	/*	var  user, callAuthenStub;
		// TODO: 		1)	When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
		before(function (done) {
			req = httpMocks.createRequest({
				method: 'GET',
				url: '/users',
				headers : {	authorization: 'Basic b25lQGFvbC5jb206b25l'	},
				body: {
					user: user
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
		});*/
		// describe('Test middleware.callAuthen:', function () {
		// //a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
		// 	xit('should return corresponding user document when passed valid credentials'
		// 	, function (done) {
		//
		// 		middleware.credentials(req, res, function next(error) {
		// 			/*if (res.locals.authorization ===  'Basic b25lQGFvbC5jb206b25l') {
		// 				res.status(200).json(req.body.user);
		// 			} else {
		// 				res.status(404);
		// 			}*/
		// 		});
		// 		middleware.callAuthen(req, res, function next(error) {
		// 			if(error) return error;
		// 		});
		// 		middleware.result(req, res);
		// 		// console.log(res);
		// 		// console.log('RES.STATUSCODE:------------------>', res.statusCode);
		// 		expect(res.statusCode).to.deep.equal(200);
		// 		expect(req.body.user).to.deep.equal(getUser);
		// 		//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
		// 			// it('should respond with 200 and a user object', function (done) {
		// 			// 	var userData = {
		// 			// 		username: 'nodejs'
		// 			// 	};
		// 			//
		// 			// 	getUserStub.returns(userData);
		// 			//
		// 			// 	request
		// 			// 		.get('/users/nodejs')
		// 			// 		.expect('Content-Type', /json/)
		// 			// 		.expect(200, function (err, res) {
		// 			// 			expect(res.body).to.deep.equal({
		// 			// 				status: 'ok',
		// 			// 				data: userData
		// 			// 			});
		// 			// 			done();
		// 			// 		});
		// 			// });
		// 		//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
		// 		done();
		// 		console.log(res.statusCode, res.statusMessage, res.locals);
		// 	});	// End it('should return user doc')
		// });


// });	// End describe('User Route Test Suite') Suite


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
