/**
 * NetworkModule
 */
app.tetris.Network.init = (function(htOptions){

    if(!app.tetris.io){
        app.tetris.io = io.connect(app.tetris.config.sHost, {
            timeout : 10000
        });

        app.tetris.Game.Network.init();
        app.tetris.Account.Network.init();
    }
});


app.tetris.Network.startSession = function() {
    app.tetris.Network.oSessionIo = io.connect(app.tetris.config.sSessionUrl);

    var oSessionIo = app.tetris.Network.oSessionIo;

    oSessionIo.on('resConnectionCount', function (htRes) {

        app.tetris.Network.Model.set({
            'nConnectedUser': htRes.nConnectedUser,
            'nRegisterUser': htRes.nRegisterUser
        });
    });

    oSessionIo.on('connect', function () {
        $('#selectable').empty();
        oSessionIo.emit('reqConnectionCount');
    });
};

