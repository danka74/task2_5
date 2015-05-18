var mongoose = require('mongoose');

var CasePartSchema = new mongoose.Schema({
  reference: String, // reference to element in case HTML
  type: String // term binding or constraint binding
});

mongoose.model('CasePart', CasePartSchema);
