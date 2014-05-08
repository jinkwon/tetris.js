var console = require('clog'),
	SocketIo = require('socket.io'),
	Async = require('async');

var oSocketIo = SocketIo.listen(8888),
	aRoom = [],
	aConnectedPeople = [],
	aGamePeople = [],
	bRealGame = false,
	htSelectedGamePeople = {},
	htMonitor = {};

oSocketIo.configure(function(){

	oSocketIo.enable('browser client minification');  // send minified client
    oSocketIo.enable('browser client etag');          // apply etag caching logic based on version number
    oSocketIo.enable('browser client gzip');          // gzip the file
    oSocketIo.enable('browser client etag');
    oSocketIo.set('log level', 0);
    //oSocketIo.set('polling duration', htSocketConfig.nPollingDuration);
    //oSocketIo.set('close timeout', 6000);
    //oSocketIo.set('transports', htSocketConfig.aTransports);
});

var oMonitorIo = oSocketIo.of('/monitor').on('connection', function(oMonitor){
	pushPeopleInfo();
	htMonitor[oMonitor.id] = oMonitor;
	
	oMonitor.on('disconnect', function(){
		// htSelectedGamePeople.splice(htSelectedGamePeople.indexOf(oMonitor.id), 1);
		delete htSelectedGamePeople[oMonitor.id];
		delete htMonitor[oMonitor.id];
	}).on('reqAdmin', function(sEmpNo){
		var sStatus = '';
		sEmpNo = sEmpNo + '';
		sEmpNo = sEmpNo.toUpperCase();
		
		switch(sEmpNo){
			case 'NT10588':
			case 'NT10725':
			
				if(bRealGame){
					sStatus = 'game';
				}else{
					sStatus = 'ok';
				}
				break;
			default :
				sStatus = 'no';
				break;
		}
		oMonitor.emit('resAdmin', sStatus);
	}).on('sendStart', function(){
		bRealGame = true;
		oGameIo.in('game').emit('pushStart');
	}).on('sendStop', function(){
		bRealGame = false;
		oGameIo.in('game').emit('pushStop');
	}).on('sendSelectedGamePeople', function(aSelectedGamePeople){
		htSelectedGamePeople[oMonitor.id] = aSelectedGamePeople;
		
		
	});
});

var oGameIo = oSocketIo.of('/game').on('connection', function(oGame){
	oGame.on('reqJoin', function(htData){
		var htRes = clone(htData);
		if(isExistingUser(htData.sEmpNo)){
			htRes.sStatus = 'exist';
			console.debug('exist', htData.sEmpNo, oGame.id);
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
		
		console.debug('aConnectedPeople', aConnectedPeople);
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
		
		console.debug('aConnectedPeople', aConnectedPeople);
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
			disconnect(oGame.id);
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


var oChatIo = oSocketIo.of('/chat').on('connection', function(oChat){
	oChat.on('sendJoin', function(htData){
		// console.debug('sendJoin', htData);
	});
});

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

var removeUserFromArray = function(aArray, sGameId, fCb){
	var nUserIndex = getUserIndexFromArrayByGameId(aArray, sGameId);
	if(nUserIndex > -1){
		aArray.splice(nUserIndex, 1);
	}
	(fCb = fCb || function () {})();
};

var isExistingUser = function(sEmpNo){
	if(getUserIndexFromArrayByEmpNo(aConnectedPeople, sEmpNo) > -1){
		return true;
	}else{
		return false;
	}
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

var cancelFromReady = function(oGame){
	oGame.leave('game');
	removeUserFromArray(aGamePeople, oGame.id, function(){
		pushPeopleInfo();
	});
}

var getUserIndexFromArrayByEmpNo = function(aArray, sEmpNo){
	for(var i=0, nCount=aArray.length; i<nCount; i++){
		if(aArray[i]['sEmpNo'] === sEmpNo){
			return i;
		}
	}
	return -1;
};

var getUserIndexFromArrayByGameId = function(aArray, sGameId){
	for(var i=0, nCount=aArray.length; i<nCount; i++){
		if(aArray[i]['sGameId'] === sGameId){
			return i;
		}
	}
	return -1;
};

var getUserFromArrayByGameId = function(aArray, sGameId){
	var nIndex = getUserIndexFromArrayByGameId(aArray, sGameId);
	if(nIndex > -1){
		return aArray[nIndex]; 
	}
	return false;
}

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
