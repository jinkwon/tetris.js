var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema   = mongoose.Schema;

var User = new Schema({
    "id" : Number,
    "sessionId" : String,
    "userId" : {type : String, index : true},
    "passwd" : String,
    "login_at" :  { type: Date, default: Date.now },
    "created_at" : { type: Date, default: Date.now }
});

var League = new Schema({
    'seq' : Number,
    'users' : Array,
    'created_at' : Date
});


var roomUser = new Schema({ 
    _id : Schema.ObjectId,
    sessionId : String,
    userId : String,
    aMatrix : Array,
    nScore : Number
});

var Room = new Schema({
    'seq' : Number,
    'ownerId' : Schema.ObjectId,
    'ownerSessionId' : String,
    'roomId': String,
    'users' : [roomUser],
    'created_at' : { type: Date, default: Date.now },
    'bIsPlaying' : Boolean
});

mongoose.model('User', User);
mongoose.model('League', League);
mongoose.model('Room', Room);


//User.method.pre('save', function(){
//   
//    console.log(document);
//    
//    next();
//});

mongoose.connect('mongodb://localhost/tetrisJS');