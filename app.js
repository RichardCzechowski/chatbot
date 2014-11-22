var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var parseString = require('xml2js').parseString;
var minutes = 5, the_interval = minutes * 60 * 1000;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var accountSid = process.env.SID;
var authToken = process.env.AUTH_TOKEN;
var toNum = process.env.TO_NUM;
var fromNum = process.env.FROM_NUM;

//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

sendInsult();
var newxml = "";
var oldxml = "";

setInterval(function() {
  console.log("I am doing my 5 minutes check");
  sendInsult();
}, the_interval);

function sendInsult(){
  console.log(newxml +" " + oldxml);
  http.get("http://www.dickless.org/api/insult.xml", function(res) {
    newxml="";
    console.log("Got response: " + res);
    res.on('data', function(chunk){
      newxml+=chunk;
    });

    res.on('end', function(){
      if (newxml != oldxml){
        oldxml=newxml;
        parseString(newxml, function(err, result){
          var str = result;
          if(str.insults){
            str = JSON.stringify(str.insults.insult).replace("[","").replace("]","");
            console.log(str);
            client.messages.create({
              to: toNum,
              from: "+19519003168",
              body: str,
            }, function(err, message) {
              console.log(message.sid);
            });
          }
        });
      }
    });

  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
