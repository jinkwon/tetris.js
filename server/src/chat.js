var oChatIo = oSocketIo.of('/chat').on('connection', function(oChat){
    oChat.on('sendJoin', function(htData){
        // console.debug('sendJoin', htData);
    });
});
