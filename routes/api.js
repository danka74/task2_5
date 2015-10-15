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
				res.write('date\tuser\tscenario\ttemplate\tsource\tcode-system\tassessment\ttarget\n');
				for (b in bindings) {
					var binding = bindings[b];
					var user = binding.user.uid;
					var scenario = binding.scenario ? "ALT" : "SCT";
					var date = binding.date.toISOString();
					if(binding.lhsBinding.assessment != undefined)
						res.write(date + '\t' + user + '\t' + scenario + '\t'
								+ binding.template + '\t'
								+ binding.lhsBinding.source + '\t'
								+ binding.lhsBinding.codeSystem + '\t'
								+ binding.lhsBinding.assessment + '\t'
								+ binding.lhsBinding.target + '\n');
					if(binding.rhsOverall.assessment != undefined)
						res.write(date + '\t' + user + '\t' + scenario + '\t'
								+ binding.template + '\t'
								+ binding.lhsBinding.source + '-overall\t'
								+ binding.rhsOverall.codeSystem + '\t'
								+ binding.rhsOverall.assessment + '\t'
								+ binding.rhsOverall.target + '\n');
					for (var r = 0; r < binding.rhsBindings.length; r++) {
						if(binding.rhsBindings[r].assessment != undefined)
							res.write(date + '\t' + user + '\t' + scenario + '\t'
									+ binding.template + '\t'
									+ binding.rhsBindings[r].source + '\t'
									+ binding.rhsBindings[r].codeSystem + '\t'
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
				template: this.template,
				source: this.lhsBinding.source,
				codeSystem: this.lhsBinding.codeSystem,
				assessment: this.lhsBinding.assessment,
				target: this.lhsBinding.target}, 1);
		if(this.rhsOverall.assessment != undefined)
			emit({date: date,
				user: user,
				scenario: scenario,
				template: this.template,
				source: this.rhsOverall.source,
				codeSystem: this.rhsOverall.codeSystem,
				assessment: this.rhsOverall.assessment,
				target: this.rhsOverall.target}, 1);
		for(b in this.rhsBindings) {
				if(this.rhsBindings[b].assessment != undefined)
					emit({date: date,
						user: user,
						scenario: scenario,
						template: this.template,
						source: this.rhsBindings[b].source,
						codeSystem: this.rhsBindings[b].codeSystem,
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

var trim = function(string) {
	if(typeof string !== "string")
		return string;

	var vb = string.indexOf("|");
	if(vb == -1)
		return string;

	return string.substring(0, vb).trim();
};

router.get('/agreestat1/:scenario/:item', function(req, res, next) {
	res.writeHead(200, {'Content-Type': 'text/csv', 'Cache-Control': 'no-cache'});
	Binding.find().exec(
			function(err, bindings) {
				if (err) {
					return err;
				}
				var users = [];
				var elements = [];
				var data = [];

				for (b in bindings) {
					var binding = bindings[b];

					// check to see if it's the right scenario
					var scenario = binding.scenario ? "ALT" : "SCT";
					if(scenario !== req.params.scenario)
						continue;

					// get user index
					var userIndex = users.indexOf(binding.user.uid);
					if(userIndex == -1) {
						userIndex = users.push(binding.user.uid) - 1;
						data.push([]);
					}
//					console.log(userIndex, binding.user.uid);

					// lhs binding
					if(binding.lhsBinding.assessment != undefined) {
						// get the index of the source element
						var elementIndex = elements.indexOf(binding.lhsBinding.source);
						if(elementIndex == -1) {
							elementIndex = elements.push(binding.lhsBinding.source) - 1;
//							data[userIndex].push("Y");
						}
//						console.log(elementIndex, binding.lhsBinding.source);

						if(req.params.item == "target")
							data[userIndex][elementIndex] = trim(binding.lhsBinding.target);
						else if(req.params.item == "assessment")
							data[userIndex][elementIndex] = binding.lhsBinding.assessment;
						else if(req.params.item == "codeSystem")
							data[userIndex][elementIndex] = binding.lhsBinding.codeSystem;
//						console.log(binding.lhsBinding.target, data[userIndex][elementIndex]);
//						if(data[userIndex][elementIndex] === undefined || data[userIndex][elementIndex] == "undefined")
//							data[userIndex][elementIndex] = " ";


					}

					// rhs overall
					if(binding.rhsOverall.assessment != undefined) {
						// get the index of the source element
						var elementIndex = elements.indexOf(binding.lhsBinding.source + '-overall');
						if(elementIndex == -1) {
							elementIndex = elements.push(binding.lhsBinding.source + '-overall') - 1;
//							data[userIndex].push("Z");
						}

						if(req.params.item == "target")
							data[userIndex][elementIndex] = trim(binding.rhsOverall.target);
						else if(req.params.item == "assessment")
							data[userIndex][elementIndex] = binding.rhsOverall.assessment;
						else if(req.params.item == "codeSystem")
							data[userIndex][elementIndex] = binding.rhsOverall.codeSystem;
//						if(data[userIndex][elementIndex] === undefined || data[userIndex][elementIndex] == "undefined")
//							data[userIndex][elementIndex] = " ";

					}

					// rhs bindings
					for(b in binding.rhsBindings) {
						if(binding.rhsBindings[b].assessment != undefined) {
							// get the index of the source element
							var elementIndex = elements.indexOf(binding.rhsBindings[b].source);
							if(elementIndex == -1) {
								elementIndex = elements.push(binding.rhsBindings[b].source) - 1;
//								data[userIndex].push("U");
							}

							if(req.params.item == "target")
								data[userIndex][elementIndex] = trim(binding.rhsBindings[b].target);
							else if(req.params.item == "assessment")
								data[userIndex][elementIndex] = binding.rhsBindings[b].assessment;
							else if(req.params.item == "codeSystem")
								data[userIndex][elementIndex] = binding.rhsBindings[b].codeSystem;
//						if(data[userIndex][elementIndex] === undefined || data[userIndex][elementIndex] == "undefined")
//								data[userIndex][elementIndex] = " ";

						}
					}
				}
				var usersLen = users.length;
				var elementsLen = elements.length;

				// output heading with users
				for(var usersI = 0; usersI < usersLen; usersI++) {
					res.write(',"' + users[usersI] + '"');
				}
				res.write('\n');

				for(var elementsI = 0; elementsI < elementsLen; elementsI++) {
					res.write('"' + elements[elementsI] + '"');
					for(var usersI = 0; usersI < usersLen; usersI++) {
						if(data[usersI][elementsI] === undefined || data[usersI][elementsI] == "undefined")
							res.write(',');
						else
							res.write(',"' + data[usersI][elementsI] + '"');
					}
					res.write('\n');
				}
				res.end();
			});

});


module.exports = router;
