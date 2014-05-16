var _ = require('underscore');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var aConnectedPeople = [];

var onReqConnectionCount = function(){
    
    var htData = {
        nConnectedUser : aConnectedPeople.length,
        sId : this.id,
        nRegisterUser : 0,
        nSingleGameUser : 10,
        nReadyGameUser : 10
    };

    console.info(('onReqConnectionCount').blue, htData);
    
    User.find({}, function(err, doc){
        
        htData.nRegisterUser = doc.length;
        oSessionIo.emit('resConnectionCount', htData);    
    })
    
};

var onDisconnect = function(){
    var oSession = this;
    
    aConnectedPeople = _.filter(aConnectedPeople, function(item){
        return item.id !== oSession.id;
    });

    onReqConnectionCount();
    console.info(('onDisconnect ::' + this.id).magenta);
};

var onConnection = function(oSessionIo, oSession){
    var id = oSession.id;
    
    var htUserInfo = { id : id };

    aConnectedPeople.push(htUserInfo);
    console.info(('onConnection :: ' + id).magenta);
    oSession
        .on('disconnect', onDisconnect)
        .on('reqConnectionCount', onReqConnectionCount);
//        .on('reqAdmin', onReqAdmin)
};

module.exports = {
    init : function(oSocketIo){
        oSessionIo = oSocketIo.of('/session').on('connection', function(oSession){
            onConnection(oSessionIo, oSession);
        });
        return oSessionIo;
    }
};
