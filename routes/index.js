var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var Binding = mongoose.model('CaseBinding');
var User = mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title : 'Express'
	});
});

// generate token based on user id
router.get('/gentoken', function(req, res, next) {
	// find user in database
	User.find({
		uid : req.query.uid
	}, function(err, users) {
		// if error or user is not in database
		if (err || users.length == 0) {
			res.status(404);
			return next(err);
		}
		// create token
		var token = jwt.sign({
			uid : req.query.uid
		}, process.env.SECRET);
		// send a link
		res.send('<a href="/?token=' + token + '">' + token + '</a>');
	});

});

module.exports = router;
