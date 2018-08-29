'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const routes = require("./routes");
const mongoose = require("mongoose");
const jsonParser = require("body-parser").json;
const session = require('express-session');

const app = express();

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

app.use(jsonParser());

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	if(req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE");
		return res.status(200).json({});
	}
	next();
});


mongoose.connect("mongodb://localhost:27017/course-api", {useNewUrlParser: true});
const db = mongoose.connection;


db.on("error", function(err){
	console.error("connection error:", err);
});

db.once("open", function(){
	console.log("db connection successful");
});

app.use(session( {
  secret: 'treehouse loves you',
  resave: false,
  saveUninitialized: false
}));



// TODO add additional routes here
app.use("/api", routes);

// send a friendly greeting for the root route
app.get('/', (req, res) => {
  res.status(200)
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

// uncomment this route in order to test the global error handler
app.get('/error', function (req, res) {
  throw new Error('Test error');
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});


module.exports = server