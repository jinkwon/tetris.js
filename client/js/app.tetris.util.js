/**
 * 유틸 메서드 모음 
 */
app.tetris.util = {}; 

app.tetris.util.leadingSpaces = function(n, digits) {
	var space = '';
	n = n.toString();
	if (n.length < digits) {
		for (var i = 0; i < digits - n.length; i++)
		  space += '0';
	}
	return space + n;
};


app.tetris.util.makeGuid = function(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});
}
