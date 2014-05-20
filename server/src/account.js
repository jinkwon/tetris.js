var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('underscore');
var oAccountIo;
var oSess;
var Room = mongoose.model('Room');

var error = function(sMessage, nCode){
    return {bAvail : false, sMessage : sMessage, code : nCode};
};

var success = function(){
    return {bAvail : true};
};

var onReqJoin = function(htData, oAccount){

    isExistId(htData.userId, function(bResult){
        console.log('onReqJoin', htData);
        
        if(bResult === true){
            oAccount.emit('resJoin', error('Already exist Id', 400));
            return;
        }
        
        new User({
            userId : htData.userId,
            passwd : htData.passwd,
            sessionId : oAccount.id,
            created_at : new Date()
        }).save(function(err){
            if (!err) {
                console.log('Successfully Saved');

                oSess.broadCastConnectionCount();
            } else {
                console.log(err);
            }

            oAccount.emit('resJoin', success());
        });
    });
};


var isExistId = function(sId, cb){
    User.find({userId : sId}, function(err, doc){
        cb(doc.length > 0, doc);
    });
};

var isAvailLoginId = function(sId, sPw, cb){
    User.findOne({userId : sId, passwd : sPw}, function(err, doc){
        cb(doc);
    });
};

var onReqLogin = function(htData, oAccount){
    htData = _.extend({userId : null, passwd : null}, htData);
    console.log('onReqLogin'.green);

    isAvailLoginId(htData.userId, htData.passwd, function(user){

        if(user){
            user.login_at = new Date();
            user.sessionId = oAccount.id;
            user.save();
            
            
            Room.find({ ownerId : user._id }, function(err, docs){
                
                _.each(docs, function(doc){
                    doc.ownerSessionId = user.sessionId;
                    
                    doc.save(function(err, doc){
                    });
                });
            });
        }

        oAccount.emit('resLogin', {id : htData.userId, bAvail : !!user});
    });
};

module.exports = {
    init : function(oSocketIo, oSessionIo){
        oSess = oSessionIo;

        oAccountIo = oSocketIo.of('/account').on('connection', function(oAccount){


            oAccount
            .on('reqJoin', function(htData){
                    console.log(htData);
                onReqJoin(htData, oAccount);
            })
            .on('reqLogin', function(htData){
                onReqLogin(htData, oAccount);
            });
        });
        
        return oAccountIo;
    }
};
