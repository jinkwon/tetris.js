app.tetris.config = {
	sMode : "development", // production, staging, developement
    sHost :""
};

app.tetris.config.setEnv = function(sMode) {
    app.tetris.config.sMode = sMode;
    app.tetris.config._refresh();
};

app.tetris.config._refresh = function(){

    var sSrvUrl = '';

    switch(app.tetris.config.sMode){
        case 'production' :
            sSrvUrl = 'http://srv.bdyne.net:8080';
            break;
        case 'staging' :
            sSrvUrl = 'http://' + document.location.hostname + ':8080';
            break;
        default :
            sSrvUrl = 'http://' + document.location.hostname + ':8080';
            break;
    }

    app.tetris.config.sHost = sSrvUrl;
    app.tetris.config.sAccountUrl = sSrvUrl + '/account';
    app.tetris.config.sSessionUrl = sSrvUrl + '/session';
    app.tetris.config.sMonitorUrl = sSrvUrl + '/monitor';
    app.tetris.config.sGameUrl = sSrvUrl + '/game';
    app.tetris.config.sChatUrl = sSrvUrl + '/chat';
};