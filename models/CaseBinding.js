var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({text: String, date: {type: Date, default: Date.now() }} );

var BindingSchema = new mongoose.Schema({
	target: String,
	part: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplatePart'},
	comments: [CommentSchema]
	});

var CaseBindingSchema = new mongoose.Schema({
  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
  bindings: [BindingSchema],
  comments: [CommentSchema],
  user: {type: String, index: true}
});

mongoose.model('CaseBinding', CaseBindingSchema);