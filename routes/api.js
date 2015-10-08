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
	if(req.accepts('text/csv')) {
    res.writeHead(200, {'Content-Type': 'text/csv', 'Cache-Control': 'no-cache'});
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
					var date = binding.date.toISOString();
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
	}
	else if(req.accepts('json')) {
		Binding.find().exec(
				function(err, bindings) {
					if (err) {
						return err;
					}

					res.json(bindings);
				});
	}

});

router.get('/comments', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/csv'});
	Binding.find().exec(
			function(err, bindings) {
				if (err) {
					return err;
				}
				res.write('date\tuser\tscenario\tcomment\n')
				for (b in bindings) {
					var binding = bindings[b];
					var user = binding.user.uid;
					var scenario = binding.scenario ? "ALT" : "SCT";
					var printComments = function(source, comments) {
						for(var c = 0; c < comments.length; c++) {
							ct = comments[c];
							res.write(ct.date.toISOString() + '\t' + user + '\t' + scenario + '\t' + source + '\t' + JSON.stringify(ct.text) + '\n');
						}
					}
					printComments(binding.template, binding.comments);
					if(binding.lhsBinding.comments != undefined)
						printComments(binding.lhsBinding.source, binding.lhsBinding.comments);
					if(binding.rhsOverall.comments != undefined)
						printComments(binding.rhsOverall.source, binding.rhsOverall.comments);
					for (var r = 0; r < binding.rhsBindings.length; r++) {
						if(binding.rhsBindings[r].comments != undefined)
							printComments(binding.rhsBindings[r].source, binding.rhsBindings[r].comments);
					}
				}
				res.end();
			});
	// res.end();

});

router.get('/dashboard1', function(req, res, next) {

	var o = {};

	o.map = function() {
		var scenario = this.scenario ? "ALT" : "SCT";
		emit({ scenario: scenario, assessment: this.lhsBinding.assessment}, 1);
		emit({ scenario: scenario, assessment: this.rhsOverall.assessment}, 1);
		for(b in this.rhsBindings) {
				emit({ scenario: scenario, assessment: this.rhsBindings[b].assessment}, 1);
			};
	};

	o.reduce = function(key, values) {
		return values.length;
	};

	o.out = {inline: 1};

	Binding.mapReduce(o, function (err, results) {
		if(err) {
			console.log(err);
			res.json({error: 1});
		}

		console.log(results);
		res.json(results);
	});


});

router.get('/dashboard2', function(req, res, next) {

	var o = {};

	o.map = function() {
		var scenario = this.scenario ? "ALT" : "SCT";
		var date = this.date ? this.date.toISOString() : {};
		var user = this.user ? this.user.uid : {};
		if(this.lhsBinding.assessment != undefined)
			emit({date: date,
				user: user,
				scenario: scenario,
				source: this.lhsBinding.source,
				assessment: this.lhsBinding.assessment,
				target: this.lhsBinding.target}, 1);
		if(this.rhsOverall.assessment != undefined)
			emit({date: date,
				user: user,
				scenario: scenario,
				source: this.rhsOverall.source,
				assessment: this.rhsOverall.assessment,
				target: this.rhsOverall.target}, 1);
		for(b in this.rhsBindings) {
				if(this.rhsBindings[b].assessment != undefined)
					emit({date: date,
						user: user,
						scenario: scenario,
						source: this.rhsBindings[b].source,
						assessment: this.rhsBindings[b].assessment,
						target: this.rhsBindings[b].target}, 1);
			};
	};

	o.reduce = function(key, values) {
		return values[0];
	};

	o.out = {inline: 1};

	Binding.mapReduce(o, function (err, results) {
		if(err) {
			console.log(err);
			res.json({error: err});
		}

		res.json(results);
	});


});


module.exports = router;
