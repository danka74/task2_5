var mongoose     = require('mongoose');
 
var UserSchema   = new mongoose.Schema({
    email: String,
    password: String,
    token: String
});
 
module.exports = mongoose.model('User', UserSchema);
