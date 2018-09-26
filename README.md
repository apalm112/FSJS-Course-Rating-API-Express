# FSJS Project #11: Course-Rating-API-Express
A REST API using Express. The API will provide a way for users to review educational courses: users can see a list of courses in a database; add courses to the database; and add reviews for a specific course. This project uses REST API design, Node.js, and Express to create API routes, along with Mongoose and MongoDB for data modeling, validation, and persistence.



## Installation

##### Ensure that you have MongoDB installed.

##### Get the REST API Running:
* In a terminal run:
```
$ mongod
```
* In a separate terminal tab browse to the `src/database/seed-data` folder & run the commands:

```
$ mongoimport --db api --collection courses --type=json --jsonArray --file courses.json

$ mongoimport --db api --collection users --type=json --jsonArray --file users.json

$ mongoimport --db api --collection reviews --type=json --jsonArray --file reviews.json
```

Clone the GitHub repository & use `npm` to install the dependencies.

```
$ git clone git@github.com:apalm112/FSJS-Course-Rating-API-Express.git

$ npm install
```

* Run the app from the command line with:
```
$ mongod

$ npm start
```

* Enter the routes in Postman to see results.
