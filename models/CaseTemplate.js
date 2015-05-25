var mongoose = require('mongoose');

var CaseTemplateSchema = new mongoose.Schema({
  title: String, // case template title
  url: String, // url to case template
  parts: [{
	  ref: String, // reference to element in case HTML
	  type: String // term binding or constraint binding
	}]
});

mongoose.model('CaseTemplate', CaseTemplateSchema);
