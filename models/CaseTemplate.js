var mongoose = require('mongoose');

var CaseTemplatePartSchema = new mongoose.Schema({
	ref : String, // reference to element in case HTML
	type : String // term binding or constraint binding
});

var CaseTemplateSchema = new mongoose.Schema({
	title : String, // case template title
	url : String, // url to case template
	parts : [ CaseTemplatePartSchema ]
});

mongoose.model('CaseTemplate', CaseTemplateSchema);
