var mongoose = require('mongoose');

var CaseBindingSchema = new mongoose.Schema({
  template: {type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplate'},
  lhsBindning:  {
	  target: { type: String, required: true },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  },
  rhsBindings: [ {
	  target: { type: String, required: true },
	  comments: [ {text: String, date: {type: Date, default: Date.now() }} ]
  } ],
  comments: [ {text: String, date: {type: Date, default: Date.now() }} ],
  user: {type: String, required: true, index: true}
});

mongoose.model('CaseBinding', CaseBindingSchema);