app.tetris.Network.oAccountIo = io.connect(app.tetris.config.sAccountUrl);

app.tetris.Network.oAccountIo
    .on('connect_failed', function (err) {
        console.log(err);
    })
    .on('resLogin', function(htData){
        app.tetris.Account.Info.bAvail = htData.bAvail;
        if(app.tetris.Account.Info.bAvail){
            app.tetris.Account.Info.broadcast('onSuccessLogin');
        } else {
            app.tetris.Account.Info.broadcast('onFailLogin');
        }
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
        
        app.tetris.Network.oAccountIo.emit('reqLogin', app.tetris.Account.Info.getAccount());
    });

app.tetris.Account.Info.load();

//setInterval(function(){
app.tetris.Network.oAccountIo.emit('reqLogin', {
    userId : app.tetris.Account.Info.userId,
    passwd : app.tetris.Account.Info.passwd
});
//}, 1000);