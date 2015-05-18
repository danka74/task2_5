var mongoose = require('mongoose');
var Case = mongoose.model('Case');
var CasePart = mongoose.model('CasePart');

router.get('/cases', function(req, res, next) {
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
