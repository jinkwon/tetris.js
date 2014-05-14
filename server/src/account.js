var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('underscore');
var oAccountIo;

var error = function(sMessage, nCode){
    return {bAvail : false, sMessage : sMessage, code : nCode};
};

var success = function(){
    return {bAvail : true};
};

var onReqJoin = function(htData, oAccount){

    isExistId(htData.userId, function(bResult){

        if(bResult === true){
            oAccount.emit('resJoin', error('Already exist Id', 400));
            return;
        }
        
        console.log('onReqJoin', htData);
        new User({
            userId : htData.userId,
            passwd : htData.passwd,
            sessionId : this.id,
            created_at : new Date()
        }).save(function(err){
            if (!err) {
                console.log('Successfully Saved');
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
    User.find({userId : sId, passwd : sPw}, function(err, doc){
        cb(doc.length > 0, doc);
    });
};

var onReqLogin = function(htData, oAccount){
    htData = _.extend({userId : null, passwd : null}, htData);
    console.log('onReqLogin'.green);

    isAvailLoginId(htData.userId, htData.passwd, function(bResult, doc){
        User.where('userId', htData.userId).update({login_at : new Date});
        oAccount.emit('resLogin', {bAvail : bResult});
    });
};

module.exports = {
    init : function(oSocketIo){

        oAccountIo = oSocketIo.of('/account').on('connection', function(oAccount){
            oAccount.on('reqJoin', function(htData){
                onReqJoin(htData, oAccount);
            })
            .on('reqLogin', function(htData){
                onReqLogin(htData, oAccount);
            });
        });
        
        return oAccountIo;
    }
};
