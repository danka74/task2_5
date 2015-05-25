var mongoose = require('mongoose');

var CaseBindingSchema = new mongoose.Schema({
  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
  bindings: [{
	  target: String,
	  part: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplatePart'},
	  comments: [{text: String, date: {type: Date, default: Date.now() }} ]
	}],
  comments: [{text: String, date: {type: Date, default: Date.now() }} ],
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true}
});

mongoose.model('CaseBinding', CaseBindingSchema);