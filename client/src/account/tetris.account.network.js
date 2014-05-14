app.tetris.Network.oAccountIo = io.connect(app.tetris.config.sAccountUrl);

app.tetris.Network.oAccountIo
    .on('resLogin', function(htData){
        app.tetris.AccountInfo.bAvail = htData.bAvail;
        if(app.tetris.AccountInfo.bAvail){
            app.tetris.AccountInfo.broadcast('onSuccessLogin');
        } else {
            app.tetris.AccountInfo.broadcast('onFailLogin');
        }
    })
    .on('resJoin', function(htData){
        
        if(htData.bAvail === false){
            
            alert(htData.sMessage);
            return;
        }
        
        app.tetris.AccountInfo.on('onSuccessLogin', function () {
            app.tetris.AccountInfo.save();
            app.tetris.Router.navigate('menu', {trigger: true});
        });
        
        app.tetris.Network.oAccountIo.emit('reqLogin', app.tetris.AccountInfo.getAccount());
    });

app.tetris.AccountInfo.load();

//setInterval(function(){
app.tetris.Network.oAccountIo.emit('reqLogin', {
    userId : app.tetris.AccountInfo.userId,
    passwd : app.tetris.AccountInfo.passwd
});
//}, 1000);