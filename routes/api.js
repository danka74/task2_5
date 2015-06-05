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

router.get('/bindings/:template/:user', function(req, res, next) {
	console.log("user = " + req.params.user);
	console.log("template = " + req.params.template);
	Binding.findOne({
		user : {
			uid : req.params.user
		},
		template : req.params.template
	}, function(err, bindings) {
		if (err) {
			return next(err);
		}
		res.json(bindings);
	});
});

router.get('/bindings/:id', function(req, res, next) {
	console.log("binding id = " + req.params.id);
	Binding.findById(req.params.id, function(err, data) {
		if (err) {
			return next(err);
		}
		res.json(data);
	})
});

router.put('/bindings/:id', function(req, res, next) {

	Binding.findById(req.params.id, function(err, persistBinding) {
		if (err) {
			return next(err);
		}
				
		console.log("in = " + req.body);

		for (prop in req.body) {
			console.log(prop + " = " + req.body[prop]);

			persistBinding[prop] = req.body[prop];
		}

		console.log("out = " + persistBinding);

		persistBinding.save(function(err, post) {
			if (err) {
				return next(err);
			}

			res.json(persistBinding);
		});
	})

});

router.post('/bindings', function(req, res, next) {
	var binding = new Binding(req.body);

	console.log(binding);

	binding.save(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(binding);
	});
});

module.exports = router;
