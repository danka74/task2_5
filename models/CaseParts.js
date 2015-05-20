var mongoose = require('mongoose');

var CaseTemplatePartSchema = new mongoose.Schema({
  reference: String, // reference to element in case HTML
  type: String // term binding or constraint binding
});

mongoose.model('CaseTemplatePart', CaseTemplatePartSchema);
