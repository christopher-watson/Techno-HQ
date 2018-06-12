var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var fs = require("fs");
var path = require("path")
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
var databaseURL = "mongodb://localhost/technohqdb";

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseURL);
};

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a'
})
app.use(logger("dev", {
  stream: accessLogStream
}));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: true
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  db.Event.remove({}, function(err) { 
    console.log('collection removed') 
 });
  axios.get("https://www.residentadvisor.net/events/us/newyork").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h1").each(function (i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children()
        .text();
      result.img = $(this)
        .parent()
        .parent()
        .children('a')
        .children('img')
        .attr('src');

      db.Event.find().sort({ dateadded: -1 });
      db.Event.create(result)
        .then(function (dbEvent) {
          // View the added result in the console
          console.log(dbEvent);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/events", function (req, res) {
  db.Event.find({})
    .then(function (dbEvent) {
      res.json(dbEvent);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/events/:id", function (req, res) {
  db.Event.findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function (dbEvent) {
      res.json(dbEvent);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/events/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Event.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbEvent) {
      res.json(dbEvent);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});