var mongoose = require('mongoose');

var BindingSchema = new mongoose.Schema({
  type: String,
  target: String,
  part: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplatePart'}
  comment: String;
});

mongoose.model('Binding', BindingSchema);
