const express = require('express');
const app = express();


// PARSER FOR JSON DATA
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded ( {
	extended : true
}));
app.use(bodyParser.json());


// CONFIGURE SERVER
app.use(express.static(__dirname + '/app'));
app.get('/', function(req, res, next) {
    res.render('public/index.html');
});


app.listen(3000);
console.log("waiting on localhost:3000");



/**
 * import json
from flask import Flask
from flask import render_template
app = Flask(__name__)

app.route('/app/index.html')


if (__name__ == "__main__"):
  app.run(port=3000)
  print("waiting on localhost:3000") 
 
 */