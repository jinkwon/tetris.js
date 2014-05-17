var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var User = new Schema({
    "id" : Number,
    "sessionId" : String,
    "userId" : {type : String, index : true},
    "passwd" : String,
    "login_at" :Date,
    "created_at" : Date
});

mongoose.model('User', User);

mongoose.connect('mongodb://localhost/tetrisJS');