var mongoose = require('mongoose');

var CaseBindingSchema = new mongoose.Schema({
  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
  scenario: {type: Boolean },
  date: {type: Date, default: Date.now() },
  lhsBinding: {
	  codeSystem: { type: String },
	  target: { type: String },
	  assessment: { type: String },
	  source: {type: String },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  },
  rhsOverall: {
	  codeSystem: { type: String },
	  target: { type: String },
	  assessment: { type: String },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  },
  rhsBindings: [ {
	  codeSystem: { type: String },
	  target: { type: String },
	  assessment: { type: String },
	  source: {type: String },
	  sourceTemplatePart: mongoose.Schema.Types.ObjectId ,
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  } ],
  comments: [ {text: String, date: {type: Date, default: Date.now() }} ],
  user: { uid: {type: String, index: true} }
});

mongoose.model('CaseBinding', CaseBindingSchema);