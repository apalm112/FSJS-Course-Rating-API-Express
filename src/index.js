'use strict';

// load modules
const express = require('express');
const app = express();

const logger = require('morgan');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(logger('dev'));

mongoose.connect('mongodb://localhost:27017/api', { useNewUrlParser: true });
// mongoose.set('debug', true);  //<--runs debugger in terminal

// Create a variable to hold the database connection object.
const database = mongoose.connection;

// app object resisters middleware w/ use(), applies it to all routes.
app.use(express.json());
// jsonParser middleware parses request to make it accessible to req.body
app.use(express.urlencoded({ extended: false }));

database.on('error', (error) => {
	// set terminal stdout color red for error message
	console.log('\x1b[31m%s\x1b[0m', '-----------------Error Connecting to Database. Connection Failed------------------------');
	console.error('\x1b[31m%s\x1b[0m', (error.message.slice(0, 81) + ']'));
});

database.once('open', () => {
	console.log('\x1b[32m%s\x1b[0m', '-----------------Database Connection Successfully Opened------------------------');
});

// Binds the routes to app object, mounts the routes to the express app specifiying '/api' as the path.
app.use('/api', routes);

// send a friendly greeting for the root route, acts as a placeholder for the browser in this project. Otherwise the express global error handler will be triggered when the path is set to '/'
app.get('/', (req, res) => {
	res.json({
		message: 'Welcome to the Course-API, such wow.'
	});
});

// Catches requests that fall through w/out triggering any route handlers, send 404 if no other route matched
app.use((req, res, next) => {
	let error = new Error('Something went horribly wrong.  API Route Not Found.');
	error.status = 404;
	next(error);
});

// global error handler
/* {
    "error": {}
}*/
app.use((error, req, res, next) => {
	res.status(error.status || 500)
	.json({ error: { message: error.message}
	});
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
	console.log('\x1b[32m%s\x1b[0m', `Express server is listening on port ${server.address().port}`);
});
