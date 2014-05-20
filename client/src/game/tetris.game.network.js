
app.tetris.Game.Network = {};

app.tetris.Game.Network.init = function(){

    var oSessionIo = io.connect(app.tetris.config.sSessionUrl);
    var oGameIo = io.connect(app.tetris.config.sGameUrl);

    oSessionIo
        .on('connect', function() {
            console.log(arguments);
    });
    
    
    oGameIo
        .on('connect', function(socket){
            console.log('connect', arguments);
//            oGameIo.emit('reqJoinLeague', {
//            });
            
            
            
        })
        .on('resQuickGame', function(){
            console.log('resQuickGame', arguments);
        
            setTimeout(function(){
                
            
            oGameIo.emit('reqStartGame', {});
            }, 5000);
        })
        .on('brGameStart', function(htObj){
          
            console.log('brGameStart');

            if(htObj.bIsStarted){
                // play Game
                console.log('GAME BEGIN');

                app.tetris.Game.Network.sRoomName = htObj.sRoomName;
            }
        })
        .on('brGameInfo', function(htObj){
            console.log('brGameInfo');
            
        })
        .on('resStartGame', function(htObj){
            console.log('resStartGame', arguments);
            
            if(htObj.bIsStarted){
                // play Game
                console.log('GAME BEGIN');

                app.tetris.Game.Network.sRoomName = htObj.sRoomName;
            }
        })
        .on('brLeagueClosed', function(){
            console.log(arguments);
        });

    app.tetris.Game.Network.oGameIo = oGameIo;
};