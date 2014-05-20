app.tetris.Account.Network = {};



app.tetris.Account.Network.connect = function(cb){
    if(!app.tetris.Account.Network.io){
        app.tetris.Account.Network.io = io.connect(app.tetris.config.sAccountUrl, {
            timeout : 5000
        });

        app.tetris.Account.Network.io
            .on('connection', function(){
                if(cb){
                    cb();
                }

                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
            })
            .on('reconnect', function(){
                
                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
            })
            .on('disconnect', function(){
                alert('disconnected');
            })
            .on('error', function(){
                alert('Cannot connect to Server');
                app.tetris.Account.Network.io = null;
            })
            .on('reconnect_failed', function(){
                console.log('reconnect_failed');
            })
            .on('connect_failed', function (err) {
                console.log(err);
                alert('Connect failed');
            })
            .on('resLogin', function(htData){
                console.log(htData.bAvail);
                app.tetris.Account.Info.bAvail = htData.bAvail;
                if(app.tetris.Account.Info.bAvail){
                    app.tetris.Account.Info.broadcast('onSuccessLogin');
                } else {
                    app.tetris.Account.Info.broadcast('onFailLogin');
                }

                app.tetris.Game.Network.oGameIo.emit('reqQuickGame', {});
            })
            .on('resJoin', function(htData){

                if(htData.bAvail === false){
                    alert(htData.sMessage);
                    return;
                }

                app.tetris.Account.Info.on('onSuccessLogin', function () {
                    app.tetris.Account.Info.save();
                    app.tetris.Menu.View.render();
                    app.tetris.Router.navigate('menu', {trigger: true});
                });

                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
            });
    }
    
    if (app.tetris.Account.Network.io.socket.connected === false && app.tetris.Account.Network.io.socket.connecting === false) {
        app.tetris.Account.Network.io.socket.connect();
    } else {
        
        
        if(cb){
            cb();
        }
    }
    
    
};