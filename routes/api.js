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

router.delete('/case_templates/:template', function(req, res) {
	CaseTemplate.remove(req.case_template, function(err) {
		if(err) {
			return next(err);
		}
	})
	res.json(req.case_template);
});

router.get('/bindings', function(req, res, next) {
	console.log("bindings count");
	Binding.find({
		user : { uid: req.user.uid }
	}, function (err, bindings) {
	    if (err) {
	        next(err);
	        return 0;
	    } else {
	    	var count = 0;
	    	console.log("bindings length " + bindings.length);
	    	for (var b = 0; b < bindings.length; b++) {
				var binding = bindings[b];
				if(binding.lhsBinding.assessment != undefined)
					count++;
				if(binding.rhsOverall.assessment != undefined)
					count++;

				for(var rhsB = 0; rhsB < binding.rhsBindings.length; rhsB++) {
					if(binding.rhsBindings[rhsB].assessment != undefined)
						count++;
				}
	    	}
	    	console.log(count);
	    	res.json(count);
	    }
	});
});

router.get('/bindings/:template/:scenario', function(req, res, next) {
	console.log("get, user = " + JSON.stringify(req.user));
	console.log("template = " + req.params.template);
	Binding.findOne({
		user : { uid: req.user.uid },
		template : req.params.template,
		scenario : req.params.scenario
	}, function(err, bindings) {
		if (err) {
			return next(err);
		}
		res.json(bindings);
	});
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
	console.log(JSON.stringify(req.body));

	var binding = new Binding(req.body);

	console.log(JSON.stringify(binding));

	console.log("post, user = " + JSON.stringify(req.user));

	binding.user = { uid: req.user.uid };

	console.log(JSON.stringify(binding));

	binding.save(function(err) {
		if (err) {
			return next(err);
		}

		res.json(binding);
	});
});

router.get('/stats', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/csv'});
	Binding.find().exec(
			function(err, bindings) {
				if (err) {
					return err;
				}
				res.write('date\tuser\tscenario\tsource\tassessment\ttarget\n')
				for (b in bindings) {
					var binding = bindings[b];
					var user = binding.user.uid;
					var scenario = binding.scenario ? "ALT" : "SCT";
					var date = binding.date;
					if(binding.lhsBinding.assessment != undefined)
						res.write(date + '\t' + user + '\t' + scenario + '\t'
								+ binding.lhsBinding.source + '\t'
								+ binding.lhsBinding.assessment + '\t'
								+ binding.lhsBinding.target + '\n');
					if(binding.rhsOverall.assessment != undefined)
						res.write(date + '\t' + user + '\t' + scenario + '\t'
								+ binding.lhsBinding.source + '-overall\t'
								+ binding.rhsOverall.assessment + '\t'
								+ binding.rhsOverall.target + '\n');
					for (var r = 0; r < binding.rhsBindings.length; r++) {
						if(binding.rhsBindings[r].assessment != undefined)
							res.write(date + '\t' + user + '\t' + scenario + '\t'
									+ binding.rhsBindings[r].source + '\t'
									+ binding.rhsBindings[r].assessment + '\t'
									+ binding.rhsBindings[r].target + '\n');
					}
				}
				res.end();
			});
	// res.end();

});


module.exports = router;
