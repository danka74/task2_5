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
    res.writeHead(200, {'Content-Type': 'text/csv'});
	Binding.find().exec(
			function(err, bindings) {
				if (err) {
					return err;
				}
				res.write('user\tscenario\tsource\tassessment\ttarget\n')
				for (b in bindings) {
					var binding = bindings[b];
					var user = binding.user.uid;
					var scenario = binding.scenario;
					res.write(user + '\t' + scenario + '\t'
							+ binding.lhsBinding.source + '\t'
							+ binding.lhsBinding.assessment + '\t'
							+ binding.lhsBinding.target + '\n');
					res.write(user + '\t' + scenario + '\t'
							+ binding.lhsBinding.source + '-overall\t'
							+ binding.rhsOverall.assessment + '\t'
							+ binding.rhsOverall.target + '\n');
					for (var r = 0; r < binding.rhsBindings.length; r++) {
						res.write(user + '\t' + scenario + '\t'
								+ binding.rhsBindings[r].source + '\t'
								+ binding.rhsBindings[r].assessment + '\t'
								+ binding.rhsBindings[r].target + '\n');
					}
				}
				res.end();
			});
	//res.end();

});

module.exports = router;
