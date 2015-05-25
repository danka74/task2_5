var mongoose = require('mongoose');

var CaseSchema = new mongoose.Schema({
  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
  bindings: [{type: mongoose.Schema.Types.ObjectId, ref: 'Binding'}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Case', CaseSchema);