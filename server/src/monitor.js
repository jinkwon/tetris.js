var colors = require('colors');
var _ = require('underscore');
var htMonitor = {};
var aConnectedPeople = [];
var aGamePeople = [];
var bRealGame = false;
var htSelectedGamePeople = {};
var oMonitor;
var oMonitorIo;

var onReqAdmin = function(sEmpNo) {
    var sStatus = '';
    sEmpNo = sEmpNo + '';
    sEmpNo = sEmpNo.toUpperCase();

    switch (sEmpNo) {
        case 'NT10588':
        case 'NT10725':
            if (bRealGame) {
                sStatus = 'game';
            } else {
                sStatus = 'ok';
            }
            break;
        default :
            sStatus = 'no';
            break;
    }
    oMonitor.emit('resAdmin', sStatus);
};

var pushPeopleInfo = function(oMonitorIo){
    oMonitorIo.emit('pushPeopleInfo', {
        aConnectedPeople : aConnectedPeople,
        aGamePeople : aGamePeople,
        bRealGame : bRealGame
    });
};

var onDisconnect = function () {
    // htSelectedGamePeople.splice(htSelectedGamePeople.indexOf(oMonitor.id), 1);
    delete htSelectedGamePeople[oMonitor.id];
    delete htMonitor[oMonitor.id];
    delete aConnectedPeople[oMonitor.id];
};

var onSendStart = function () {
    bRealGame = true;
    oGameIo.in('game').emit('pushStart');
};

var onSendStop = function () {
    bRealGame = false;
    oGameIo.in('game').emit('pushStop');
};

var onSendSelectedGamePeople = function (aSelectedGamePeople) {
    htSelectedGamePeople[oMonitor.id] = aSelectedGamePeople;
};

var onConnection = function(oMonitorIo, oMon){
    oMonitor = oMon;
    
    var id = oMonitor.id;
    var htUserInfo = {
        id : oMonitor.Id
    };
    
    aConnectedPeople.push(htUserInfo);
    
    pushPeopleInfo(oMonitorIo);
    

    console.info(('onConnection :: ' + id).magenta);
    htMonitor[oMonitor.id] = oMonitor;

    oMonitor
        .on('disconnect', onDisconnect)
        .on('reqAdmin', onReqAdmin)
        .on('sendStart', onSendStart)
        .on('sendStop', onSendStop)
        .on('sendSelectedGamePeople', onSendSelectedGamePeople);
};


module.exports = {
    init : function(oSocketIo){
        oMonitorIo = oSocketIo.of('/monitor').on('connection', function(oMonitor){
            onConnection(oMonitorIo, oMonitor);
        });
        return oMonitorIo;
    }
};
