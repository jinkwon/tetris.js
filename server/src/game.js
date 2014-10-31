Async = require('async');

var CronJob = require('cron').CronJob;
var Moment = require('moment');

var colors = require('colors');
var mongoose = require('mongoose');
var League = mongoose.model('League');
var Room = mongoose.model('Room');
var User = mongoose.model('User');
var Score = mongoose.model('Score');

var _ = require('underscore');

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

var findOpenedGame = function(cb){
    Room
    .find({ bIsPlaying : false})
    .sort({created_at : 'asc'})
    .exec(function(err, docs){
        if(!err && docs.length > 0){
            cb(docs[0]);
        } else {
            cb(null);
        }
    });

};

var getUserInfoBySocketId = function(sSessionId, cb) {
    User.findOne({sessionId: sSessionId}, function (err, doc) {
        if (doc !== null) {
            cb(doc);
        } else {
            cb(false);
        }
    });
}

function isRoomMakerInRoom(oSocketIo, oRoom){
    
    var ownerClient = oSocketIo.roomClients[oRoom.ownerSessionId];
    var bIsOwnerInRoom = false;

    if(ownerClient){
        var sRoomChannel = '/game/' + oRoom.roomId;
        bIsOwnerInRoom = ownerClient[sRoomChannel] || false;
    }

    return (bIsOwnerInRoom);
}

function isOwnerInRoom(oSocketIo, oRoom, cb){
   isInRoomBy({ sessionId : oRoom.ownerUserId}, oSocketIo, oRoom, function(bFlag){
       console.log('roomMaker In Room : '.magenta, bFlag);
       cb(bFlag);
   });
}

function createRoom(oGame, cb) {
    console.log('createRoom :'.green);
    
    var sRoomId = 'rooms_' + guid();
    // if not have
    // create new room and make him to owner
    var htObj = {
        bIsPlaying: false,
        ownerSessionId: oGame.id,
        roomId: sRoomId
    };

    User.findOne({sessionId : oGame.id}, function(err, doc){
        if(doc){
            htObj.ownerId = doc.userId;
        }
        
        new Room(htObj).save(function (err, doc) {
            
            if(err){
                console.log('Room Save Err');
                return;
            }
            oGame.join(sRoomId);
            
            if(cb){
                cb({ bIsJoined: true, sRoomId: sRoomId, nMemberCount: 1, sOwnerId: oGame.id});
            }
        });

    });
}


function joinExistRoom(oGame, oRoom, oSocketIo) {
    oGame.join(oRoom.roomId);

    var sRoomId = oRoom.roomId;
    broadCastRoomInfoBy(sRoomId, oGame, function (result, htRoomInfo) {
        oGame.emit('resQuickGame', htRoomInfo);
    });

    var bOwnerInFlag = isRoomMakerInRoom(oSocketIo, oRoom); 
        
    getUserInfoBySocketId(oGame.id, function (oUser) {
        console.log(oGame.id, bOwnerInFlag, oUser);
        console.log(Moment(oRoom.created_at).unix(), Moment().subtract('minutes', 2).unix());

        // 2분 보다 오래된 방에
        if (Moment(oRoom.created_at).unix() < Moment().subtract('minutes', 2).unix()) {

            // 주인이 없으면 내가 주인이 될 수 있다
            if (bOwnerInFlag === false) {
                oRoom.ownerId = oUser ? oUser.userId : '';
                oRoom.ownerSessionId = oGame.id;
                oRoom.created_at = new Date();
                oRoom.save(function (err, doc) {
                    console.log(('changed Owner to ' + oGame.id).magenta);
                    var sRoomId = oRoom.roomId;
                    broadCastRoomInfoBy(sRoomId, oGame, function (result) {});
                });
            }
        }
    });
}
function joinQuickGame(oGame, oSocketIo) {
// find Opend Game

    findOpenedGame(function (oRoom) {
        // if have
        // join to that game
        if (oRoom) {
            joinExistRoom(oGame, oRoom, oSocketIo);
        } else {
            createRoom(oGame, function(htRoomInfo){
                oGame.emit('resQuickGame', htRoomInfo);
            });
        }
    });
}

var getMemberCountByRoomId = function(roomId, oGame, bFilter){
    var users = oGame.manager.rooms['/game/' + roomId];
    var nLen = 0;

    if(users){
        nLen = users.length;
    }

    return nLen;
};

var broadCastRoomInfoBy = function(sRoomId, oGame, cb){
    var nMemberCount = getMemberCountByRoomId(sRoomId, oGame);
    
    Room.findOne({roomId : sRoomId, bIsPlaying : false}, function(err, oRoom){
        if(oRoom){
            var htRoomInfo = { sRoomId : sRoomId, nMemberCount : nMemberCount, sOwnerId : oRoom.ownerSessionId};
            oGame.emit('brRoomInfo', htRoomInfo);
            oGame.broadcast.in(sRoomId).emit('brRoomInfo', htRoomInfo);
        }

        console.log(('BROADCAST > brRoomInfo : ' + sRoomId + ': ' + !!oRoom).magenta);
        if(cb){
            cb(!!oRoom, htRoomInfo);    
        }
    });
};

var isOwner = function(oGame, doc) {
    return doc && oGame.id === doc.ownerSessionId;
};

var broadcastNeighbor = function(msg, oRoom, sessionId, oGame) {
    var socket = oGame.manager.sockets.sockets[sessionId];
    var idx = null;

    oRoom.users.sort(function(a, b){ return a.nScore < b.nScore; });

    for (var i = 0; i < oRoom.users.length; i++) {
        if (oRoom.users[i].sessionId === sessionId) {
            idx = i;
            break;
        }
    }

    msg.nMyRank = idx + 1;

    if (socket) {
        socket.emit('brGameInfo', msg);
    }
};

var sendToNeighbor = function(oGame, oRoom, oUser, obj) {
    var idx = null;
    for (var i = 0; i < oRoom.users.length; i++) {
        if (oRoom.users[i].sessionId === oGame.id) {
            idx = i;
            break;
        }
    }

    var msg = {
        nRank : idx + 1,
        sessionId: oGame.id,
        sUserId: oUser.userId,
        aMatrix: obj.aMatrix,
        nTotal : oRoom.users.length,
        nScore: obj.nScore
    };

    // To Front
    if (idx - 1 >= 0) {
        msg.sType = 'im_back';
        broadcastNeighbor(msg, oRoom, oRoom.users[idx - 1].sessionId, oGame);
    }

    // To Back
    if (idx + 1 < oRoom.users.length) {
        msg.sType = 'im_front';
        broadcastNeighbor(msg, oRoom, oRoom.users[idx + 1].sessionId, oGame);
    }
};

var onUnsubscribe = function(data, oGame) {
    oGame.leave(data.sRoomId);

    Room.findOne({roomId : data.sRoomId}, function(err, oRoom){
        if(oRoom){
            var sRoomId = data.sRoomId;
            broadCastRoomInfoBy(sRoomId, oGame);
        }
    })
};
var updateMaxScore = function(obj, oGame, oUser){

    if(oUser.sessionId){
        var $p = Score.findOne({userId : oUser.userId}).exec();
    } else {
        var $p = Score.findOne({sessionId : oGame.id}).exec();
    }

    $p.then(function(oScore){

        if(oScore){
            if(oScore.nScore >= obj.nScore){
                return;
            }

            oScore.nScore = obj.nScore;
            oScore.save(function(){
            });

        } else {
            oScore = new Score({
                nScore : obj.nScore,
                sessionId : oGame.id,
                userId : oUser ? oUser.userId : ''
            });

            oScore.save(function(){});
        }

        brScoreBoard(oGame);
    });

};

var onBrGameInfo = function(obj, oGame){
    var sRoomId = obj.sRoomId || '';

    var $p = User.findOne({sessionId : oGame.id}).exec();
    $p.then(function(oUser){

        var $p = Room.findOne({roomId : sRoomId}).exec();
        $p.then(function(oRoom){
            if(!oUser){
                oUser = {
                    userId : 'guest_' + guid().substr(0, 5)
                }
            }

            updateMaxScore(obj, oGame, oUser);

            var bExist = _.find(oRoom.users, function(user){
                return (user.sessionId === oGame.id);
            });

            if(!bExist){

                oRoom.users.push({
                    sessionId : oGame.id,
                    userId : oUser.userId,
                    aMatrix : obj.aMatrix,
                    nScore : obj.nScore
                });

                oRoom.users.sort(function(a, b){ return a.nScore < b.nScore; });

                oRoom.save(function(err, doc){
                    if(!err){
                        console.log('User Added');
                    }

                    sendToNeighbor(oGame, oRoom, oUser, obj);
                });

            } else {

                var idx = null;
                for(var i = 0; i < oRoom.users.length; i++){
                    if(oRoom.users[i].sessionId === oGame.id){
                        idx = i;
                        break;
                    }
                }

                if(idx !== null){
                    oRoom.users[idx].sessionId = oGame.id;
                    oRoom.users[idx].userId = oUser.userId;
                    oRoom.users[idx].aMatrix = obj.aMatrix;
                    oRoom.users[idx].nScore = obj.nScore;
                    oRoom.users.sort(function(a, b){ return a.nScore < b.nScore; });

                    oRoom.save(function(err){
                        sendToNeighbor(oGame, oRoom, oUser, obj);
                    });
                }


                var myIdx = null;
                for (var i = 0; i < oRoom.users.length; i++) {
                    if (oRoom.users[i].sessionId === oGame.id) {
                        myIdx = i;
                        break;
                    }
                }

                var htGameInfo = {
                    sRoomId : sRoomId,
                    nRank : idx + 1
                };

                oGame.broadcast.in(sRoomId).emit('brGameInfo', htGameInfo);

                htGameInfo.nTotal = oRoom.users.length;
                htGameInfo.myRank = myIdx ? myIdx + 1 : null;
                oGame.emit('brGameInfo', htGameInfo);

            }
        });


    });
};

var reqStartGame = function(obj, oGame){
    // if he is owner
    // start that room game
    var sRoomId = obj.sRoomId;
    var $p = Room.findOne({ownerSessionId :  oGame.id, roomId : sRoomId}).exec();

    $p.then(function(doc){

        if(!isOwner(oGame, doc)) {
            oGame.emit('resStartGame', { sRoomId : sRoomId, bIsStarted : false, msg : 'NO PERMISSION', code : 400 });
            return;
        }

        // is Owner
        if(doc.bIsPlaying === false){
            doc.bIsPlaying = true;
            var $p = doc.save().exec();

            $p.then(function(doc){
                oGame.emit('resStartGame', { bIsStarted : true , sRoomId : doc.roomId});
                oGame.emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true});
                oGame.broadcast.in(doc.roomId).emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true});

            }, function(err){
                oGame.emit('resStartGame', { bIsStarted : false });
            });

        } else {
            oGame.emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true, bAlreadyStarted : true});
            oGame.broadcast.in(doc.roomId).emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true, bAlreadyStarted : true});
        }

    });

};


var onDisconnect = function(oGame){
    console.log(('disconnected : ' + oGame.id).yellow);
    var client = oGame.manager.roomClients[oGame.id];

    if(client){
        for(var sRoomChannel in client){
            oGame.leave(sRoomChannel);
            oGame.manager.rooms[sRoomChannel] = _.without(oGame.manager.rooms[sRoomChannel], oGame.id);

            var aNameSpliter = sRoomChannel.split('/');
            if(aNameSpliter[2] && aNameSpliter[1] === 'game'){
                var sRoomId = aNameSpliter[2];
                broadCastRoomInfoBy(sRoomId, oGame);
            }
        }
    }
};


function brScoreBoard(oGame) {
    var $p = Score.find().limit(10).sort({nScore: 'desc'}).exec();

    $p.then(function (results) {
        if (!results) {
            return;
        }

        var aScores = [];

        _.each(results, function (score) {
            aScores.push({
                userId: score.userId,
                score: score.nScore
            });
        });

        oGame.emit('brScoreBoard', {
            aScores: aScores
        });

        console.log('brScoreBoard');
    });
}

module.exports = {
    init : function(oSocketIo){
        var oGameIo = oSocketIo.of('/game');

        oGameIo.on('connection', function(oGame){
            console.log(('CONNECTED : ' + oGame.id).magenta);
            oGame
                .on('reqScoreBoard', function(data){
                    brScoreBoard(oGame);
                })
                .on('subscribe', function(data) {
                    oGame.join(data.sRoomId);
                })
                .on('unsubscribe', function(data){
                    onUnsubscribe(data, oGame);
                })
                .on('reqQuickGame', function(obj){
                    joinQuickGame(oGame, oSocketIo);
                })
                .on('reqRoomInfo', function(obj){
                    broadCastRoomInfoBy(obj.sRoomId, oGame);
                })
                .on('brGameInfo', function(obj){
                    onBrGameInfo(obj, oGame)
                })
                .on('reqStartGame', function(obj){
                    reqStartGame(obj, oGame);
                })
                .on('disconnect', function(){
                    onDisconnect(oGame);
                });
        });

        return oGameIo;
    }
};