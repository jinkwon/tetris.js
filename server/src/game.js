Async = require('async');

var CronJob = require('cron').CronJob;
var Moment = require('moment');

var colors = require('colors');
var mongoose = require('mongoose');
var League = mongoose.model('League');
var Room = mongoose.model('Room');
var User = mongoose.model('User');

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

var getUserInfoBySocketId = function(sSocketId, cb) {
    User.findOne({sessionId: sSocketId}, function (err, doc) {
        if (doc !== null) {
            cb(doc);
        } else {
            cb(false);
        }
    });
}

function isInRoomBy(filter, oSocketIo, oRoom, cb){
    User.findOne(filter, function(err, doc){
        if(!doc){
            cb(false);
            return;
        }
        
        var ownerClient = oSocketIo.roomClients[doc.sessionId];
        var bIsOwnerInRoom = false;

        if(ownerClient){
            var sRoomChannel = '/game/' + oRoom.roomId;
            bIsOwnerInRoom = ownerClient[sRoomChannel] || false;
        }

        cb(bIsOwnerInRoom);
    });
}

function isOwnerInRoom(oSocketIo, oRoom, cb){
   isInRoomBy({_id : oRoom.ownerUserId}, oSocketIo, oRoom, function(bFlag){
       console.log('roomMaker In Room : '.magenta, bFlag);
       cb(bFlag);
   });
}

function getRoomBy(obj, cb){
    User.findOne({sessionId : obj.sessionId}, function(err, doc){

        if(doc){
            Room.findOne({ownerSessionId : doc.sessionId, roomId : obj.roomId}, function(err, doc){
                cb(err || doc);
            });
        } else {
            cb(err);
        }
    })
}

function createRoom(oGame, cb) {
    getUserInfoBySocketId(oGame.id, function (oUser) {
        if (oUser) {

            var sRoomId = 'rooms_' + guid();
            // if not have
            // create new room and make him to owner
            var htObj = {
                ownerId: oUser._id,
                bIsPlaying: false,
                ownerSessionId: oGame.id,
                roomId: sRoomId
            };

            new Room(htObj).save(function (doc) {
                oGame.join(sRoomId);
                
                if(cb){
                    cb({ bIsJoined: true, sRoomId: sRoomId, nMemberCount: 1, sOwnerId: oGame.id});
                }
            });
        }
    });
};


function joinExistRoom(oGame, oRoom, oSocketIo) {
    oGame.join(oRoom.roomId);

    var sRoomId = oRoom.roomId;
    broadCastRoomInfoBy(sRoomId, oGame, function (result, htRoomInfo) {
        oGame.emit('resQuickGame', htRoomInfo);
    });

    isOwnerInRoom(oSocketIo, oRoom, function (bOwnerInFlag) {
        getUserInfoBySocketId(oGame.id, function (oUser) {

            // 20 분 보다 오래된 방에
            if (Moment(oRoom.created_at).unix() < Moment().subtract('minutes', 2).unix()) {

                // 주인이 없으면 내가 주인이 될 수 있다
                if (oUser && bOwnerInFlag === false) {
                    oRoom.ownerId = oUser._id;
                    oRoom.sOwnerId = oUser.sessionId;
                    oRoom.created_at = new Date();
                    oRoom.save(function (err, doc) {
                        console.log(('changed Owner to ' + oUser.userId).magenta);

                        var sRoomId = oRoom.roomId;
                        broadCastRoomInfoBy(sRoomId, oGame, function (result) {

                        });

                    });
                }
            }
        });
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

module.exports = {
    init : function(oSocketIo){

        var oGameIo = oSocketIo.of('/game');
        
        
        oGameIo.on('connection', function(oGame){
            console.log(('CONNECTED : ' + oGame.id).magenta);
            
            oGame
                .on('subscribe', function(data) { 
                    oGame.join(data.sRoomId); 
                })
                
                .on('unsubscribe', function(data) {
                    oGame.leave(data.sRoomId);

                    Room.findOne({roomId : data.sRoomId}, function(err, oRoom){
                        if(oRoom){
                            var sRoomId = data.sRoomId; 
                            broadCastRoomInfoBy(sRoomId, oGame);
                        }
                    })
                })

                .on('reqQuickGame', function(obj){
                    joinQuickGame(oGame, oSocketIo);
                })
                
                .on('brGameInfo', function(obj){
                    var sRoomId = obj.sRoomId || '';
                    
                    console.log('brGameInfo', sRoomId, oGame.id);

                    var sendNeighbor = function(oGame, oRoom, oUser) {
                        var idx = null;
                        for (var i = 0; i < oRoom.users.length; i++) {
                            if (oRoom.users[i].sessionId === oGame.id) {
                                idx = i;
                                break;
                            }
                        }

                        var front = null;
                        var back = null;
                        var msg = {
                            nRank : idx + 1, 
                            sessionId: oGame.id,
                            sUserId: oUser.userId,
                            aMatrix: obj.aMatrix,
                            nScore: obj.nScore
                        };

                        if (idx - 1 >= 0) {
                            // yes front
                            front = oRoom.users[idx - 1];
                        }

                        if (idx + 1 < oRoom.users.length) {
                            // yes back
                            back = oRoom.users[idx + 1];
                        }

                        var socket;
                        
                        if (front) {
                            msg.sType = 'im_back';
                            socket = oGame.manager.sockets.sockets[front.sessionId];

                            if(socket){
                                socket.emit('brGameInfo', msg);
                            }
                        }

                        if (back) {
                            msg.sType = 'im_front';
                            socket = oGame.manager.sockets.sockets[back.sessionId];
                            if(socket){
                                socket.emit('brGameInfo', msg);
                            }
                        }
                    };

                    User.findOne({sessionId : oGame.id}, function(err, oUser){
                        Room.findOne({roomId : sRoomId}, function(err, oRoom){

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
                                
                                oRoom.save(function(){
                                    console.log('User Added');

                                    sendNeighbor(oGame, oRoom, oUser);
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

                                    oRoom.users.sort(function(a, b){
                                        return a.nScore < b.nScore;
                                    });
                                    
                                    oRoom.save(function(err){
                                        if(!err){
                                            console.log('exist User Saved');
                                        }

                                        sendNeighbor(oGame, oRoom, oUser);
                                    });
                                }
                            }


                            
                        });

                        oGame.broadcast.in(sRoomId).emit('brGameInfo', {
                            sRoomId : sRoomId
                        });

                        oGame.emit('brGameInfo', {

                        });

                        console.log('brGameInfo', oGame.id);
                        
                        
                    });
                })
                
                .on('reqStartGame', function(obj){
                    // if he is owner
                    // start that room game

                    console.log(obj);
                    var sRoomId = obj.sRoomId;
                    getRoomBy({ sessionId : oGame.id, roomId : sRoomId}, function(doc){
                        
                        // Owner
                        function isOwner(oGame, doc) {
                            return doc && oGame.id === doc.ownerSessionId;
                        }

                        if(isOwner(oGame, doc)){
                            
                            if(doc.bIsPlaying === false){
                                doc.bIsPlaying = true;
                                doc.save(function(err, doc){
                                    if(err){
                                        oGame.emit('resStartGame', { bIsStarted : false });
                                    } else {
                                        oGame.emit('resStartGame', { bIsStarted : true , sRoomId : doc.roomId});
                                        oGame.emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true});
                                        oGame.broadcast.in(doc.roomId).emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true});
                                    }
                                });
                                
                            } else {
                                oGame.emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true, bAlreadyStarted : true});
                                oGame.broadcast.in(doc.roomId).emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true, bAlreadyStarted : true});
                            }
                            
                            
                        // Not Owner
                        } else {
                            oGame.emit('resStartGame', { bIsStarted : false, msg : 'NO PERMISSION', code : 400 });
                        }
                    });
                    
                })
                
                .on('disconnect', function(){
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
                });
        });


        return;
/*
        var
            aGamePeople = [],
            htSelectedGamePeople = {};
        var aConnectedPeople = [];
        var bRealGame = false;




        var pushGameInfo = function(sEmpNo, sEmpNm, aMatrix, nScore){
            for(sKey in htSelectedGamePeople){
                if(htSelectedGamePeople[sKey].length > 0){

                    for(var i=0, nCnt=htSelectedGamePeople[sKey].length; i<nCnt; i++){
                        if(htSelectedGamePeople[sKey][i] === sEmpNo){
                            htMonitor[sKey].emit('pushGameInfo', {
                                sEmpNo : sEmpNo,
                                sEmpNm : sEmpNm,
                                aMatrix : aMatrix,
                                nScore : nScore
                            });
                        }
                    }
                }
            }
        };

        var putGameScore = function(oGame, nScore){
            var nUserIndex = getUserIndexFromArrayByGameId(aGamePeople, oGame.id);
            if(nUserIndex > -1){
                aGamePeople[nUserIndex]['nScore'] = parseInt(nScore, 10);
                pushPeopleInfo(); // 아무래도 부하예상,,,,1초나 0.5초마다 한번씩 보내도록 해야 할것 같음
            }
        };

        var pushPeopleInfo = function(){
            oMonitorIo.emit('pushPeopleInfo', {
                aConnectedPeople : aConnectedPeople,
                aGamePeople : aGamePeople,
                bRealGame : bRealGame
            });
        };


        var disconnect = function(sGameId){
            Async.waterfall([
                function(fCb){
                    removeUserFromArray(aConnectedPeople, sGameId, function(){
                        fCb(null);
                    });
                },
                function(fCb){
                    removeUserFromArray(aGamePeople, sGameId, function(){
                        fCb(null);
                    });
                }
            ], function(err, aResult){
                pushPeopleInfo();
            });
        };


        var getUserIndexFromArrayByEmpNo = function(aArray, sEmpNo){
            for(var i=0, nCount=aArray.length; i<nCount; i++){
                if(aArray[i]['sEmpNo'] === sEmpNo){
                    return i;
                }
            }
            return -1;
        };


        var removeUserFromArray = function(aArray, sGameId, fCb){
            var nUserIndex = getUserIndexFromArrayByGameId(aArray, sGameId);
            if(nUserIndex > -1){
                aArray.splice(nUserIndex, 1);
            }
            (fCb = fCb || function () {})();
        };

        var getUserIndexFromArrayByGameId = function(aArray, sGameId){
            for(var i=0, nCount=aArray.length; i<nCount; i++){
                if(aArray[i]['sGameId'] === sGameId){
                    return i;
                }
            }
            return -1;
        };


        var cancelFromReady = function(oGame){
            oGame.leave('game');
            removeUserFromArray(aGamePeople, oGame.id, function(){
                pushPeopleInfo();
            });
        };

        var getUserFromArrayByGameId = function(aArray, sGameId){
            var nIndex = getUserIndexFromArrayByGameId(aArray, sGameId);
            if(nIndex > -1){
                return aArray[nIndex];
            }
            return false;
        };


        var ready = function(oGame){
            var htUser = getUserFromArrayByGameId(aConnectedPeople, oGame.id);
            if(!htUser){
                return false;
            }else{
                aGamePeople.push(htUser);
                oGame.join('game');
                pushPeopleInfo();
                return true;
            }
        };

        var isExistingUser = function(sEmpNo){
            if(getUserIndexFromArrayByEmpNo(aConnectedPeople, sEmpNo) > -1){
                return true;
            }else{
                return false;
            }
        };

        
        
        var oGameIo = oSocketIo.of('/game').on('connection', function(oGame){
            oGame.on('reqJoin', function(htData){
                var htRes = clone(htData);
                if(isExistingUser(htData.sEmpNo)){
                    htRes.sStatus = 'exist';
                    console.info('exist', htData.sEmpNo, oGame.id);
                }else{
                    if(bRealGame === false){
                        htRes.sStatus = 'ok';
                        htData.sGameId = oGame.id;
                        oGame['htData'] = htData;
                        aConnectedPeople.push(htData);
                        pushPeopleInfo();
                    }else{
                        htRes.sStatus = 'game';
                    }
                }
                oGame.emit('resJoin', htRes);
        
                console.info('aConnectedPeople', aConnectedPeople);
                //console.debug('aGamePeople', aConnectedPeople);
            }).on('reqReJoin', function(htData){
                var htRes = clone(htData);
        
                if(isExistingUser(htData.sEmpNo)){
                    var nUserIdx = getUserIndexFromArrayByEmpNo(aConnectedPeople, htData.sEmpNo);
        
                    removeUserFromArray(aConnectedPeople, nUserIdx, function(){
                        console.log('removed', htData);
                    });
        
                    if(bRealGame === false){
                        htRes.sStatus = 'ok';
                        htData.sGameId = oGame.id;
                        oGame['htData'] = htData;
                        aConnectedPeople.push(htData);
                        pushPeopleInfo();
                    }else{
                        htRes.sStatus = 'game';
                    }
        
                }else{
                    if(bRealGame === false){
                        htRes.sStatus = 'ok';
                        htData.sGameId = oGame.id;
                        oGame['htData'] = htData;
                        aConnectedPeople.push(htData);
                        pushPeopleInfo();
                    }else{
                        htRes.sStatus = 'game';
                    }
                }
                oGame.emit('resJoin', htRes);
        
                console.info('aConnectedPeople', aConnectedPeople);
                //console.debug('aGamePeople', aConnectedPeople);
            }).on('reqReady', function(htData){
                var htRes = {};
                if(bRealGame){
                    htRes.sStatus = 'game';
                }else{
                    if(ready(oGame)){
                        htRes.sStatus = 'ok';
                    }else{
                        htRes.sStatus = 'err';
                    }
                }
                oGame.emit('resReady', htRes);
            }).on('reqCancel', function(htData){
                var htRes = {};
                if(bRealGame){
                    htRes.sStatus = 'game';
                }else{
                    cancelFromReady(oGame);
                    htRes.sStatus = 'ok';
                }
                oGame.emit('resCancel', htRes);
            }).on('disconnect', function(){
                if(oGame.id){
                    disconnect(oGame.id, oMonitorIo);
                }
            }).on('sendGameInfo', function(htData){
        
                if(!htData){
                    console.log('Error 113 Line : ', htData);
                    return false;
                }
                putGameScore(oGame, htData.nScore);
                pushGameInfo(oGame.htData.sEmpNo, oGame.htData.sEmpNm, htData.aMatrix, htData.nScore);
            });
        });
  
    */

        return oGameIo;
    }
    
};