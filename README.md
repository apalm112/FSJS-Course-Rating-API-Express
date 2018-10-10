# FSJS Project #11: Course-Rating-API-Express
A REST API using Express. The API will provide a way for users to review educational courses: users can see a list of courses in a database; add courses to the database; and add reviews for a specific course. This project uses REST API design, Node.js, and Express to create API routes, along with Mongoose and MongoDB for data modeling, validation, and persistence.


## Installation

##### Ensure that you have MongoDB installed on your local machine.

##### Get the REST API Running:

* Clone the repo:

	`git clone git@github.com:apalm112/FSJS-Course-Rating-API-Express.git`

* `cd` into the project folder & install dependencies:

	`$ npm i`

* In a terminal run:

	`$ mongod`

* Load the seed-data by opening a separate terminal tab, `cd` to the `src/database/seed-data` folder & run the commands:

```
$ mongoimport --db api --collection users --type=json --jsonArray --file users.json

$ mongoimport --db api --collection reviews --type=json --jsonArray --file reviews.json

$ mongoimport --db api --collection courses --type=json --jsonArray --file courses.json
```

* To run the API locally, in a new terminal tab enter:

	`$ npm start`

* Now you can use Postman to test the API routes.

To POST a new user enter the data in this format:

```JSON
{
	"fullName": 	    "Bob Jones",
	"emailAddress":     "bob@aol.com",
	"password": 	    "pass"
}
```

POST a new review in this format, where the `user` value is the users `_id`:

```json
{
	"user":     "5ba97554b7116463fd924849",
	"rating":     4,
	"review":   "Here is a new review, such wow."
}
```
