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
            var sRoomName = '/game/' + oRoom.roomId;
            bIsOwnerInRoom = ownerClient[sRoomName] || false;
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

function getRoomBy(sessionId, cb){
    User.findOne({sessionId : sessionId}, function(err, doc){

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

            // 20 분 보다 오래된 방에
            if (Moment(oRoom.created_at).unix() < Moment().subtract('minutes', 2).unix()) {

                isOwnerInRoom(oSocketIo, oRoom, function (bOnwerInFlag) {
                    if (bOnwerInFlag) {
                        oGame.emit('resQuickGame', { bIsJoined: true });
                        return;
                    }

                    // 주인이 없으면 내가 주인이 될 수 있다
                    getUserInfoBySocketId(oGame.id, function (oUser) {
                        if (oUser) {
                            oRoom.ownerId = oUser._id;
                            oRoom.created_at = new Date();
                            oRoom.save(function (err, doc) {
                                console.log(('changed Owner to ' + oUser.userId).magenta);

                                oGame.emit('resQuickGame', { bIsJoined: true });
                            });
                        }
                    });
                });
            }

        } else {
            getUserInfoBySocketId(oGame.id, function (oUser) {
                if (oUser) {
                    var sRoomName = 'rooms_' + guid();
                    // if not have
                    // create new room and make him to owner
                    var htObj = {
                        ownerId: oUser._id,
                        bIsPlaying: false,
                        roomId: sRoomName
                    };

                    new Room(htObj).save(function (doc) {
                        oGame.join(sRoomName);
                        oGame.emit('resQuickGame', { bIsJoined: true });
                    });
                }
            });


        }
    });
}


module.exports = {
    init : function(oSocketIo, oMonitorIo){

        var oGameIo = oSocketIo.of('/game')
            .on('connection', function(oGame){
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
                        var sRoomName = obj.sRoomName || '';
                        
                        oGame.broadcast.in(sRoomName).emit('brGameInfo', { sRoomName : sRoomName, bIsStarted : true});
                        console.log('brGameInfo', oGame.id);
                        
                    })
                    .on('reqStartGame', function(){
                        // if he is owner
                        // start that room game
                        getRoomBy(oGame.id, function(doc){
                            if(doc){
                                doc.bIsPlaying = true;
                                doc.save(function(err, doc){
                                    
                                    if(err){
                                        oGame.emit('resStartGame', { bIsStarted : false });
                                    } else {
//                                        var sRoomName = '/game/' + doc.roomId;
                                        oGame.emit('resStartGame', { bIsStarted : true , sRoomName : doc.roomId});
                                        
                                        oGame.broadcast.in(doc.roomId).emit('brGameStart', { sRoomName : doc.roomId, bIsStarted : true});
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
    
    //                    if(oGame.id){
    //                        disconnect(oGame.id, oMonitorIo);
    //                    }
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