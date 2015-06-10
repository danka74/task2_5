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

router.get('/stats', function(req, res, next) {
	User.find(function(err, users) {
		if (err) {
			return next(err);
		}
		res.set('Content-Type', 'text/plain');
		var result = "";
		for (u in users) {
			Binding.find({
				user : {
					uid : users[u].uid
				}
			}).exec(
					function(err, bindings) {
						if (err) {
							return next(err);
						}
						for (b in bindings) {
							console.log(b);
							console.log(users[u]);
							console.log(users[u].uid + '\t'
									+ bindings[b].lhsBinding.source + '\t'
									+ bindings[b].lhsBinding.target + '\n');

							result += (users[u].uid + '\t'
									+ bindings[b].lhsBinding.source + '\t'
									+ bindings[b].lhsBinding.target + '\n');
						}

					});
		}
		console.log(result);
		res.send(result);
	});

});

module.exports = router;
