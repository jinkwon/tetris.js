app.tetris.config = {
	sName: "Tetris",
	sMode : "development", // production, staging, developement
    sHost :""
};

var sSrvUrl = '';

switch(app.tetris.config.sMode){
    case 'production' :
        sSrvUrl = 'uit.nhncorp.com';
    break;
    case 'staging' :
        sSrvUrl = 'srv.bdyne.net';
    break;
    default : 
        sSrvUrl = document.location.hostname;
    break;
}

app.tetris.config.sHost = sSrvUrl;
app.tetris.config.sMonitorUrl = 'http://' + sSrvUrl + ':8888/monitor';
app.tetris.config.sGameUrl = 'http://' + sSrvUrl + ':8888/game';
app.tetris.config.sChatUrl = 'http://' + sSrvUrl + ':8888/chat';