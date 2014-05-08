var WebGLUtil = {};

WebGLUtil.createShader = function( gl, src, type ) {
	var shader = gl.createShader( type );
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ){
		var error = gl.getShaderInfoLog( shader );
		// Remove trailing linefeed, for FireFox's benefit.
		while( (error.length > 1) && (error.charCodeAt(error.length-1) < 32) ){
			error = error.substring(0, error.length-1);
		}
		alert(error);

		return null;
	}

	return shader;
};

WebGLUtil.loadImage = function(gl, glTexture, sImageUrl){
	var htImage = {};
	
	glTexture.bIsLoaded = false;
	
	htImage.img = new Image();
	htImage.img.src = sImageUrl;
		
	htImage.img.onload = function() {		
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, htImage.img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);

		glTexture.bIsLoaded = true;
	};
	
	htImage.img.onerror = function() {
		alert("error load texture");
	};
};

WebGLUtil.loadShader = function(url){
	var source = null;

	$.ajax({
	    async: false,
	    url: url,
	    success: function (data) {
	        source = data;
	    },
		dataType: 'text'
	});
		
	return source;
};
	
