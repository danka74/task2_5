var mongoose = require('mongoose');

var CaseTemplateSchema = new mongoose.Schema({
	title : String, // case template title
	type : String, // the semantic type of the rhs
	templateURL : String, // url to case template
	lhs : {
		name : String,
		_type : String
	}, // left hand side
	rhs : [ {
			name : String,
			_type : String
		} ], // right hand side
	description : String // case template description, markdown is used to format description
});

mongoose.model('CaseTemplate', CaseTemplateSchema);
