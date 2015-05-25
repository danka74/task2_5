var mongoose = require('mongoose');

var BindingSchema = new mongoose.Schema({
  target: String,
  part: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplatePart'},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

mongoose.model('Binding', BindingSchema);
