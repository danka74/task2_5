var mongoose = require('mongoose');

var CaseSchema = new mongoose.Schema({
  title: String,
  link: String,
  parts: [{type: mongoose.Schema.Types.ObjectId, ref: 'CasePart'}]
});

mongoose.model('Case', CaseSchema);
