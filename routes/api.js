var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var CaseTemplate = mongoose.model('CaseTemplate');
var CaseTemplatePart = mongoose.model('CaseTemplatePart');
var Binding = mongoose.model('Binding');

var auth = jwt({secret: process.env.SECRET, userProperty: 'payload'});

router.get('/case_templates', auth, function(req, res, next) {
	CaseTemplate.find(function(err, cases){
    if(err){ return next(err); }
    res.json(cases);
  });
});

router.post('/case_templates', function(req, res, next) {
  var _case = new CaseTemplate(req.body);

  _case.save(function(err, post){
    if(err){ return next(err); }

    res.json(_case);
  });
});

router.param('template', function(req, res, next, id) {
  var query = CaseTemplate.findById(id);

  query.exec(function (err, template){
    if (err) { return next(err); }
    if (!template) { return next(new Error('can\'t find case')); }

    req.template = template;
    return next();
  });
});

router.get('/case_templates/:template', auth, function(req, res) {
  res.json(req.case_template);
});



module.exports = router;
