module.exports = {
    init : function(oSocketIo, oMonitorIo){

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



        function clone(obj) {
            if (typeof obj !== 'object' || obj == null) {
                return obj;
            }

            var c = obj instanceof Array ? [] : {};

            for (var i in obj) {
                var prop = obj[i];

                if (typeof prop == 'object') {
                    if (prop instanceof Array) {
                        c[i] = [];

                        for (var j = 0; j < prop.length; j++) {
                            if (typeof prop[j] != 'object') {
                                c[i].push(prop[j]);
                            } else {
                                c[i].push(clone_obj(prop[j]));
                            }
                        }
                    } else {
                        c[i] = clone(prop);
                    }
                } else {
                    c[i] = prop;
                }
            }

            return c;
        }


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
  
    
        return oGameIo;
    }
    
};