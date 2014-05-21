// SOCKET.IO ====================================================================================================

require('./src/db.js');

var console = require('clog'),
    cron = require('cron'),
    SocketIo = require('socket.io');

var async = require('async');

var colors = require('colors');
var _ = require('underscore');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var oSocketIo = SocketIo.listen(process.env.port || 8888);

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

var oSessionIo = require('./src/session');
var oGameIo = require('./src/game');
var monitor = require('./src/monitor');
var oAccountIo = require('./src/account');

oSessionIo.init(oSocketIo);
oAccountIo.init(oSocketIo, oSessionIo);
oGameIo.init(oSocketIo, oAccountIo);

var oMonitorIo = monitor.init(oSocketIo);







// EXPRESS ====================================================================================================

var getRoomInfoWithUserId = function(cb){
    var finalResult = {};
    var rooms = oSocketIo.sockets.manager.rooms;
    var aFunc = [];
    var sRoomName;

    for(sRoomName in rooms){

        finalResult[sRoomName] = _.clone(rooms[sRoomName]);
        var aRoomMembers = finalResult[sRoomName];

        for(var i = 0, nLen = aRoomMembers.length; i < nLen; i++){

            aFunc.push(function (idx, sRoomName, callback) {

                User.findOne({sessionId: finalResult[sRoomName][idx]}, function (err, doc) {
                    if (doc !== null) {
                        finalResult[sRoomName][idx] = doc.userId;
                    }


                    callback();
                });

            }.bind(this, i, sRoomName));
        }
    }

    async.waterfall(aFunc, function(err, result){
        cb(finalResult);
    });
};



var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var ejs = require('ejs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

require('./src/oauth')(app);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat'
    , key: 'sid'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(req, res){
    
    getRoomInfoWithUserId(function(info){
        res.render('index', { roomInfo : info });
    });

});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;

app.listen(3030);

