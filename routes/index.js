var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');
var passwordless = require('passwordless');

var auth = jwt({
	secret : process.env.SECRET,
	userProperty : 'payload'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title : 'Express'
	});
});

router.get('/login', function(req, res) {
	res.render('login', { user: req.user });
});

router.get('/logout', passwordless.logout(), function(req, res) {
	res.redirect('/');
});

router.post('/sendtoken', passwordless.requestToken(
// Simply accept every user
function(user, delivery, callback) {
	callback(null, user);
	// usually you would want something like:
	// User.find({email: user}, callback(ret) {
	// if(ret)
	// callback(null, ret.id)
	// else
	// callback(null, null)
	// })
}), function(req, res) {
	res.render('sent');
});

module.exports = router;
