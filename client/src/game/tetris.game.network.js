
app.tetris.Game.Network = {};

app.tetris.Game.Network.init = function(){

    var oSessionIo = io.connect(app.tetris.config.sSessionUrl);
    var oGameIo = io.connect(app.tetris.config.sGameUrl);

    oSessionIo
        .on('connect', function() {

            console.log(arguments);

    });
    
    
    oGameIo
        .on('connect', function(){
            console.log(arguments);
            oGameIo.emit('reqJoinLeague', {

            });
        })
        .on('brLeagueClosed', function(){
            console.log(arguments);
        });

};