var mongoose = require('mongoose');

var CaseBindingSchema = new mongoose.Schema({
  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
  lhsBindning:  {
	  codeSystem: { type: String },
	  target: { type: String },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  },
  rhsOverall:  {
	  codeSystem: { type: String },
	  target: { type: String },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  },
  rhsBindings: [ {
	  codeSystem: { type: String },
	  target: { type: String },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  } ],
  comments: [ {text: String, date: {type: Date, default: Date.now() }} ],
  user: {type: String, index: true}
});

//var CaseBindingSchema = new mongoose.Schema({
//	  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
//	  lhsBindning:  {
//		  codeSystem: { type: String, required: true },
//		  target: { type: String, required: true },
//		  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
//	  },
//	  rhsOverall:  {
//		  codeSystem: { type: String, required: true },
//		  target: { type: String, required: true },
//		  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
//	  },
//	  rhsBindings: [ {
//		  codeSystem: { type: String, required: true },
//		  target: { type: String, required: true },
//		  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
//	  } ],
//	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ],
//	  user: {type: String, required: true, index: true}
//	});

mongoose.model('CaseBinding', CaseBindingSchema);