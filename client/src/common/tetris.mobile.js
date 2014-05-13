
app.mobile = {};


function meta(name, content) {
   document.write('<meta name="' + name + '" content="' + content + '">');
}

app.mobile.metaInit = function(){
	// Cache Control
	meta("expires", "-1");
	meta("Cache-Control", "No-Cache");
	meta("Pragma", "No-Cache");
	
	meta("viewport", "initial-scale=1.0, width=device-width, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");
	meta("format-detection", "address=no,telephone=no");
	
	meta("apple-mobile-web-app-capable", "yes");
	meta("apple-mobile-web-app-status-bar-style", "white");
	
	meta('apple-touch-fullscreen', 'yes');

};