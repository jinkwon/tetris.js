var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema   = mongoose.Schema;

var User = new Schema({
    "id" : Number,
    "sessionId" : {type : String, index : true},
    "userId" : String,
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
    sessionId : {type : String, index:true},
    userId : String,
    aMatrix : Array,
    nScore : Number
});

var Room = new Schema({
    'seq' : Number,
    'ownerId' : String,
    'ownerSessionId' : { type :String, index : true},
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