# FSJS Project #11: Course-Rating-API-Express
This project uses REST API design, Node.js, and Express to create API routes, along with Mongoose and MongoDB for data modeling, validation, and persistence.  
The API will provide a way for users to:
* add a new user
* review educational courses: users can see a list of courses in a database;
* add courses to the database;
* add reviews for a specific course.


## Installation

##### Ensure that you have MongoDB installed on your local machine.

##### Get the REST API Running:

* Clone the repo:

	`git clone git@github.com:apalm112/FSJS-Course-Rating-API-Express.git`

* `cd` into the project folder & install dependencies:

	`$ npm i`

* Run:

	`$ mongod`

* Load the seed-data by opening a separate terminal tab, `cd` to the `src/database/seed-data` folder & run the commands:

```
$ mongoimport --db api --collection users --type=json --jsonArray --file users.json

$ mongoimport --db api --collection reviews --type=json --jsonArray --file reviews.json

$ mongoimport --db api --collection courses --type=json --jsonArray --file courses.json
```

* To run the API locally, in a new terminal tab enter:

	`$ npm start` or `nodemon`

* Now you can use Postman to test the API routes, such as `GET localhost:5000/api/courses`.

To POST a new user enter the data in this format:

```JSON
{
	"fullName": 	    "Bob Jones",
	"emailAddress":     "bob@aol.com",
	"password": 	    "password"
}
```

POST a new review in this format, with valid email & password in Postmans Basic Auth:

```json
{
	"rating":     4,
	"review":   "Here is a new review, such wow."
}
```

* POST a new course

```json
{
    "reviews": [],
    "title": "New Course Title",
    "description": "Lorem gibson euro-pop narrative Tessier-Ashpool rain realism human RAF assassin carbon sign shanty town sub-orbital ICE Tokyo.",
    "estimatedTime": "12 hours",
    "materialsNeeded": "Lots of stuff",
    "steps": [
        {
            "stepNumber": 1,
            "title": "D&D Financing with Blockchain",
            "description": "Collect gold pieces."
        }
    ]
}
```

* Run the Tests in the console with:

`$ mocha`
