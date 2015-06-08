var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('express-jwt');

// connect to database
mongoose.connect('mongodb://localhost/task2_5');
require('./models/CaseTemplate');
require('./models/CaseBinding');
require('./models/Users');

// var pathToMongoDb = 'mongodb://localhost/passwordless-simple-mail';
// passwordless.init(new mongoStore(pathToMongoDb));
// // Set up a delivery service
// passwordless.addDelivery(function(tokenToSend, uidToSend, recipient,
// callback) {
// var host = 'localhost:3000';
// console.info('http://' + host + '/?token=' + tokenToSend + '&uid='
// + encodeURIComponent(uidToSend));
// });

var routes = require('./routes/index');
var users = require('./routes/users');
var apis = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(jwt({
	secret : process.env.SECRET,
	credentialsRequired : false,
	getToken : function fromHeaderOrQuerystring(req) {
		if (req.headers.authorization
				&& req.headers.authorization.split(' ')[0] === 'Bearer') {
			return req.headers.authorization.split(' ')[1];
		} else if (req.query && req.query.token) {
			return req.query.token;
		}
		return null;
	}
}));

app.use('/', routes);
app.use('/api', apis);
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
			message : err.message,
			error : err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message : err.message,
		error : {}
	});
});

module.exports = app;
