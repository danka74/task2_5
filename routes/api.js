var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Case = mongoose.model('Case');
var CasePart = mongoose.model('CasePart');

var auth = jwt({secret: 'Secret', userProperty: 'payload'});

router.get('/cases', auth, function(req, res, next) {
  Case.find(function(err, cases){
    if(err){ return next(err); }
    res.json(cases);
  });
});

router.post('/cases', function(req, res, next) {
  var _case = new Case(req.body);

  _case.save(function(err, post){
    if(err){ return next(err); }

    res.json(_case);
  });
});

router.param('case', function(req, res, next, id) {
  var query = Case.findById(id);

  query.exec(function (err, _case){
    if (err) { return next(err); }
    if (!_case) { return next(new Error('can\'t find case')); }

    req.case = _case;
    return next();
  });
});

router.get('/cases/:case', auth, function(req, res) {
  res.json(req.case);
});

module.exports = router;
