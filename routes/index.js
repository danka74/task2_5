var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title : 'Express'
	});
});

router.get('/gentoken/:uid', function(req, res, next) {
	var token = jwt.sign({
		uid : req.params.uid
	}, process.env.SECRET);
	res.send('<a href="/?token='+token+'">'+token+'</a>');
});

module.exports = router;
