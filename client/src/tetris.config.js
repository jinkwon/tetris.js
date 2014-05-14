app.tetris.config = {
	sName: "Tetris",
	sMode : "development", // production, staging, developement
    sHost :""
};

var sSrvUrl = '';

switch(app.tetris.config.sMode){
    case 'production' :
        sSrvUrl = '';
    break;
    case 'staging' :
        sSrvUrl = 'srv.bdyne.net:8888';
    break;
    default : 
        sSrvUrl = document.location.hostname + ':8888';
    break;
}

app.tetris.config.sHost = sSrvUrl;
app.tetris.config.sAccountUrl = 'http://' + sSrvUrl + '/account';
app.tetris.config.sSessionUrl = 'http://' + sSrvUrl + '/session';
app.tetris.config.sMonitorUrl = 'http://' + sSrvUrl + '/monitor';
app.tetris.config.sGameUrl = 'http://' + sSrvUrl + '/game';
app.tetris.config.sChatUrl = 'http://' + sSrvUrl + '/chat';
