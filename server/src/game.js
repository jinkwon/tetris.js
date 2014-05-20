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

var getLastLeague = function(cb){
    League
    .find()
    .sort({ created_at : 'desc' })
    .exec(function(err, docs) {

        if(!err && docs.length > 0){
            cb(docs[0]);
        } else {
            cb(null)
        }
    });
};

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
    
} ;

getNewLeagueSeq = function(cb){
    getLastLeague(function(doc){
        var nLeagueSeq = 0;

        if(doc !== null){
            nLeagueSeq = doc.get('seq') + 1;
        }

        cb(nLeagueSeq, doc);
    });
};

createNewLeague = function(oGameIo){
    getNewLeagueSeq(function(nLeagueSeq, doc){

        oGameIo.in(doc._id.toString())
            .emit('brLeagueClosed', { msg : 'league_closed', nClosedLeague : nLeagueSeq});
//        oGameIo.emit('brLeagueClosed', { msg : 'league_closed', nClosedLeague : nLeagueSeq});

        var htObj = {
            seq : nLeagueSeq,
            created_at : new Date()
        };

        var _onSave = function(err, doc){
            if(!err){
                console.log(('Successfully Added : League '+nLeagueSeq).green);
            }
        };

        new League(htObj).save(_onSave);

    });
};


function startLeagueCron(oGameIo) {
    createNewLeague(oGameIo);

    new CronJob('*/30 * * * * *', function () {
        console.log('cronjob Excuted');

        createNewLeague(oGameIo);

    }, null, true, "Asis/Seoul");
};

function joinLeague(id, cb){

    getLastLeague(function(doc){

        doc.users.push(id);

        doc.save(function(err, doc){
            console.log(doc);
            cb(doc._id.toString());
        });
    })
}

function outLeague(id){

    getLastLeague(function(doc){
        doc.users = _.reject(doc.users || [], function(userid){ return id === userid});

        doc.save(function(err, doc){
            console.log('outLeague');
            console.log(doc);
        });
    });
}

function getUserInfoBySocketId(sSocketId, cb) {
    
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
    User.findOne(obj, function(err, doc){

        if(doc){
            Room.findOne({ownerId : doc._id, bIsPlaying : false}, function(err, doc){
                cb(err || doc);
            });
        } else {
            cb(err);
        }
    })
}



function joinQuickGame(oGame, oSocketIo) {
// find Opend Game

    findOpenedGame(function (oRoom) {
        // if have
        // join to that game
        if (oRoom) {
            oGame.join(oRoom.roomId);

            var nMemberCount = getMemberCountByRoomId(oRoom.roomId, oGame);
            var htRoomInfo = {sRoomId : oRoom.roomId, bIsJoined : true , nMemberCount : nMemberCount, bIsOwner : oRoom.ownerSessionId === oGame.id};

            oGame.emit('resQuickGame', htRoomInfo);

            if(htRoomInfo.bIsOwner){
                oGame.emit('brRoomInfo', htRoomInfo);

                htRoomInfo.bIsOwner = false;
                oGame.broadcast.in(oRoom.roomId).emit('brRoomInfo', htRoomInfo);
            }

            isOwnerInRoom(oSocketIo, oRoom, function (bOwnerInFlag) {
                getUserInfoBySocketId(oGame.id, function (oUser) {

                    // 20 분 보다 오래된 방에
                    if (Moment(oRoom.created_at).unix() < Moment().subtract('minutes', 2).unix()) {

                        // 주인이 없으면 내가 주인이 될 수 있다
                        if (oUser && bOwnerInFlag === false) {
                            oRoom.ownerId = oUser._id;
                            oRoom.created_at = new Date();
                            oRoom.save(function (err, doc) {
                                console.log(('changed Owner to ' + oUser.userId).magenta);

                                htRoomInfo.bIsOwner = true;

                                if(htRoomInfo.bIsOwner){
                                    oGame.emit('brRoomInfo', htRoomInfo);

                                    htRoomInfo.bIsOwner = false;
                                    oGame.broadcast.in(oRoom.roomId).emit('brRoomInfo', htRoomInfo);
                                }

                            });

                            return;
                        }
                    }

                    if(htRoomInfo.bIsOwner){
                        oGame.emit('brRoomInfo', htRoomInfo);

                        htRoomInfo.bIsOwner = false;
                        oGame.broadcast.in(oRoom.roomId).emit('brRoomInfo', htRoomInfo);
                    }

                });
            });

        } else {
            getUserInfoBySocketId(oGame.id, function (oUser) {
                if (oUser) {

                    var sRoomId = 'rooms_' + guid();
                    // if not have
                    // create new room and make him to owner
                    var htObj = {
                        ownerId: oUser._id,
                        bIsPlaying: false,
                        ownerSessionId : oGame.id,
                        roomId: sRoomId
                    };

                    new Room(htObj).save(function (doc) {
                        oGame.join(sRoomId);
                        oGame.emit('resQuickGame', { bIsJoined: true, sRoomId : sRoomId, nMemberCount : 1, bIsOwner : true});
                    });
                }
            });


        }
    });
}


getMemberCountByRoomId = function(roomId, oGame, bFilter){
    var users = oGame.manager.rooms['/game/' + roomId];
    var nLen = 0;

    if(users){
        nLen = users.length;
    }

    return nLen;
};

module.exports = {
    init : function(oSocketIo, oMonitorIo){

        var oGameIo = oSocketIo.of('/game')
            .on('connection', function(oGame){

                oGame.on('subscribe', function(data) { oGame.join(data.sRoomId); });
                oGame.on('unsubscribe', function(data) {
                    oGame.leave(data.sRoomId);

                    Room.findOne({roomId : data.sRoomId}, function(err, oRoom){
                        if(oRoom){
                            var nMemberCount = getMemberCountByRoomId(oRoom.roomId, oGame);

                            var htRoomInfo = { sRoomId : oRoom.roomId, nMemberCount : nMemberCount, bIsOwner : oRoom.ownerSessionId === oGame.id};

                            if(htRoomInfo.bIsOwner){
                                oGame.emit('brRoomInfo', htRoomInfo);

                                htRoomInfo.bIsOwner = false;
                                oGame.broadcast.in(oRoom.roomId).emit('brRoomInfo', htRoomInfo);
                            }

                        }
                    })

                });


                console.log(('connected : ' + oGame.id).magenta);
                oGame
                    .on('reqJoinLeague', function(){
                        joinLeague(oGame.id, function(roomId){
//                            oGame.join(roomId);
//                            console.log(oGameIo.manager.rooms);
                            oGame.emit('resJoinLeague');
                        });
                    })
                    .on('reqOutLeague', function(){
                        oGame.emit('resOutLeague');
                    })

                    .on('reqQuickGame', function(obj){
                        joinQuickGame(oGame, oSocketIo);
                    })
                    
                    .on('brGameInfo', function(obj){
                        var sRoomId = obj.sRoomId || '';
                        
                        oGame.broadcast.in(sRoomId).emit('brGameInfo', { sRoomId : sRoomId, bIsStarted : true});
                        console.log('brGameInfo', oGame.id);
                        
                    })
                    .on('reqStartGame', function(){
                        // if he is owner
                        // start that room game
                        getRoomBy({ sessionId : oGame.id}, function(doc){
                            if(doc){
                                doc.bIsPlaying = true;
                                doc.save(function(err, doc){
                                    
                                    if(err){
                                        oGame.emit('resStartGame', { bIsStarted : false });
                                    } else {
                                        oGame.emit('resStartGame', { bIsStarted : true , sRoomId : doc.roomId});
                                        
                                        oGame.broadcast.in(doc.roomId).emit('brGameStart', { sRoomId : doc.roomId, bIsStarted : true});
                                    }
                                });
                            } else {
                                oGame.emit('resStartGame', { bIsStarted : false, msg : 'NO PERMISSION', code : 400 });
                            }
                        });
                        
                    })
                    .on('disconnect', function(){
                        console.log(('disconnected : ' + oGame.id).yellow);
                        outLeague(oGame.id);

                        var client = oGame.manager.roomClients[oGame.id];

                        if(client){
                            for(var sRoomChannel in client){
                                oGame.leave(sRoomChannel);
                                oGame.manager.rooms[sRoomChannel] = _.without(oGame.manager.rooms[sRoomChannel], oGame.id);

                                var aNameSpliter = sRoomChannel.split('/');

                                if(aNameSpliter[2]){
                                    var nMemberCount = getMemberCountByRoomId(aNameSpliter[2], oGame);
                                    oGame.broadcast.in(aNameSpliter[2]).emit('brRoomInfo', { sRoomId : aNameSpliter[2], nMemberCount : nMemberCount});
                                }

                            }
                        }
                    });
        });

//        startLeagueCron(oGameIo);

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