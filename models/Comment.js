var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now }
});

mongoose.model('Comment', CommentSchema);
