var mongoose = require('mongoose');

var CaseTemplateSchema = new mongoose.Schema({
	title : String, // case template title
	templateURL : String, // url to case template
	lhs : {
		name : String,
		_type : String
	}, // left hand side
	rhs : [ {
			name : String,
			_type : String
		} ], // right hand side
	description : String // case template description
});

mongoose.model('CaseTemplate', CaseTemplateSchema);
