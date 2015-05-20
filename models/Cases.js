var mongoose = require('mongoose');

var CaseTemplateSchema = new mongoose.Schema({
  title: String,
  link: String,
  parts: [{type: mongoose.Schema.Types.ObjectId, ref: 'CaseTemplatePart'}]
});

mongoose.model('CaseTemplate', CaseTemplateSchema);
