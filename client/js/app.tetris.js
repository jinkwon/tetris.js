app.tetris = app.tetris ? app.tetris : {};

app.tetris.config = {
	"sName": "Tetris",
	"sMode" : "development" // production, staging, developement
};

var sServerUrl = '';
if(app.tetris.config.sMode ==='production'){
	sServerUrl = 'uit.nhncorp.com';
} else if(app.tetris.config.sMode === 'staging') {
	sServerUrl = 'srv.bdyne.net';
} else {
	sServerUrl = 'localhost';
}

app.tetris.htServer = {
	sHost : sServerUrl,
	sMonitor : 'http://'+sServerUrl+':8888/monitor',
	sGame : 'http://'+sServerUrl+':8888/game',
	sChat : 'http://'+sServerUrl+':8888/chat'
};