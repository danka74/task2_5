var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var CaseTemplate = mongoose.model('CaseTemplate');
var Binding = mongoose.model('CaseBinding');

router.get('/ping', function(req, res, next) {
	res.json(req.user);
});

router.get('/case_templates', function(req, res, next) {
	CaseTemplate.find(function(err, cases) {
		if (err) {
			return next(err);
		}
		res.json(cases);
	});
});

router.post('/case_templates', function(req, res, next) {
	console.log(req.body);
	var _case = new CaseTemplate(req.body);

	_case.save(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(_case);
	});
});

router.param('template', function(req, res, next, id) {
	var query = CaseTemplate.findById(id);

	query.exec(function(err, template) {
		if (err) {
			return next(err);
		}
		if (!template) {
			return next(new Error('can\'t find case'));
		}

		req.case_template = template;
		return next();
	});
});

router.get('/case_templates/:template', function(req, res) {
	res.json(req.case_template);
});

router.param('user', function(req, res, next, id) {
	req.user = id;
	return next();
});

router.get('/bindings/:user', function(req, res, next) {
	Binding.find({
		user : req.user
	}, function(err, bindings) {
		if (err) {
			return next(err);
		}
		res.json(bindings);
	});
});

router.param('binding', function(req, res, next, id) {
	var query = Binding.findById(id);

	query.exec(function(err, binding) {
		if (err) {
			return next(err);
		}
		if (!binding) {
			return next(new Error('can\'t find case'));
		}

		req.binding = binding;
		return next();
	});
});

router.get('/bindings/:binding', function(req, res) {
	res.json(req.binding);
});

router.post('/bindings', function(req, res, next) {
	var binding = new Binding(req.body);

	binding.save(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(binding);
	});
});

module.exports = router;
