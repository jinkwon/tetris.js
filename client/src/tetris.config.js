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
        sSrvUrl = 'http://srv.bdyne.net:8888';
    break;
    default : 
        sSrvUrl = 'http://' + document.location.hostname + ':8888';
    break;
}

app.tetris.config.sHost = sSrvUrl;
app.tetris.config.sAccountUrl = sSrvUrl + '/account';
app.tetris.config.sSessionUrl = sSrvUrl + '/session';
app.tetris.config.sMonitorUrl = sSrvUrl + '/monitor';
app.tetris.config.sGameUrl = sSrvUrl + '/game';
app.tetris.config.sChatUrl = sSrvUrl + '/chat';