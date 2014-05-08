/**
 * WebGL Viewer 
 */
app.WebGLView = Backbone.View.extend({
	defaults : {
		nWidth : 0,
		nHeight : 0,
		arCameraEye : [0.0,0.0,0.0],
		arCameraLookAt : [0.0,0.0,0.0],
		fAngleYZ : 0,
		fAngleXZ : 0,
		fCameraDistance : 0,
		bCameraPerspective : false,
		nFov : 0,
		ctx : null,
		bWebGLAvailable : false
	},
	
	isAvailWebGL : function(){
		return this.bWebGLAvailable;
	},
	
	initCanvas : function(){
		var canvas = document.getElementById('game_area2');
		this.nWidth = canvas.width;
		this.nHeight = canvas.height;
		this.arCameraEye = [0.0,0.0,100.0];
		this.arCameraLookAt = [0.0,0.0,0.0];
		this.fAngleYZ = 0.0;
		this.fAngleXZ = Math.PI/2.0;
		this.fCameraDistance = 900.0;
		this.bCameraPerspective = false;
		this.nFov = 45;

		var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
		this.ctx = null;
		for(var index=0; index<names.length; ++index){
			try{
				this.ctx = canvas.getContext(names[index]);
			}
			catch(e){
				break;
			}
			if(this.ctx != null) break;
		}
		
		if(this.ctx == null){
			this.bWebGLAvailable = false;
		} else {
			this.bWebGLAvailable = true;
		}
	},
	
	initResource : function(){
		var gl = this.ctx;
		
		/////////////////////////////////////////////////////////////////////////////////////// VertexData
		var vertices = [-0.5,-0.5,0.5,	0.5,-0.5,0.5,	0.5,0.5,0.5,	-0.5,0.5,0.5,	// Front face
						-0.5,-0.5,-0.5,	-0.5,0.5,-0.5,	0.5,0.5,-0.5,	0.5,-0.5,-0.5,	// Back face
						-0.5,0.5,-0.5,	-0.5,0.5,0.5,	0.5,0.5,0.5,	0.5,0.5,-0.5,	// Top face
						-0.5,-0.5,-0.5,	0.5,-0.5,-0.5,	0.5,-0.5,0.5,	-0.5,-0.5,0.5,	// Bottom face
						0.5,-0.5,-0.5,	0.5,0.5,-0.5,	0.5,0.5,0.5,	0.5,-0.5,0.5,	// Right face
						-0.5,-0.5,-0.5,	-0.5,-0.5,0.5,	-0.5,0.5,0.5,	-0.5,0.5,-0.5	// Left face
						];
		this.gl_VB_Position_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Position_Cube);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.gl_VB_Position_Cube.itemSize = 3;
        this.gl_VB_Position_Cube.numItems = 24;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		var colors = [	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Front face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Back face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Top face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Bottom face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Right face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0		// Left face
						];
		this.gl_VB_Color_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Color_Cube);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		this.gl_VB_Color_Cube.itemSize = 4;
        this.gl_VB_Color_Cube.numItems = 24;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		var cordinate = [0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Front face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Back face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Top face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Bottom face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Right face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0		// Left face
						];
		this.gl_VB_Cordinate_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Cordinate_Cube);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cordinate), gl.STATIC_DRAW);
		this.gl_VB_Cordinate_Cube.itemSize = 2;
        this.gl_VB_Cordinate_Cube.numItems = 24;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		/////////////////////////////////////////////////////////////////////////////////////// IndexData
		var indices = [	0,1,2,		0,2,3,    // Front face
						4,5,6,		4,6,7,    // Back face
						8,9,10,		8,10,11,  // Top face
						12,13,14,	12,14,15, // Bottom face
						16,17,18,	16,18,19, // Right face
						20,21,22,	20,22,23  // Left face
						];
		this.gl_IB_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_IB_Cube);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		this.gl_IB_Cube.itemSize = 1;
        this.gl_IB_Cube.numItems = 36;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		/////////////////////////////////////////////////////////////////////////////////////// Texture
		this.gl_Tex_Cube = gl.createTexture();
		WebGLUtil.loadImage(gl, this.gl_Tex_Cube, 'img/mino_main2.png');
	},
	
	initShader : function(){
		var gl = this.ctx;
		
		/////////////////////////////////////////////////////////////////////////////////////// Shader
		this.gl_Shader_RenderProgram = gl.createProgram();
		var vertexShaderText = WebGLUtil.loadShader('shader/model.vs');
		var vertexShader = WebGLUtil.createShader(gl, vertexShaderText, gl.VERTEX_SHADER);
		var fragmentShaderText = WebGLUtil.loadShader('shader/model.fs');
		var fragmentShader = WebGLUtil.createShader(gl, fragmentShaderText, gl.FRAGMENT_SHADER);
		if( vertexShader == null || fragmentShader == null ){
			alert("Shader can not compile");
			return false;
		}
		gl.attachShader(this.gl_Shader_RenderProgram, vertexShader);
		gl.attachShader(this.gl_Shader_RenderProgram, fragmentShader);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		
		gl.linkProgram(this.gl_Shader_RenderProgram);
		if( !gl.getProgramParameter(this.gl_Shader_RenderProgram, gl.LINK_STATUS) ){
			alert("Could not initialize shaders");
			return false;
		}
		gl.useProgram(this.gl_Shader_RenderProgram);
		
		this.gl_Attribute_VertexPosition = gl.getAttribLocation(this.gl_Shader_RenderProgram, "aVertexPosition");
		this.gl_Attribute_VertexColor = gl.getAttribLocation(this.gl_Shader_RenderProgram, "aVertexColor");
		this.gl_Attribute_VertexCordinate = gl.getAttribLocation(this.gl_Shader_RenderProgram, "aVertexCordinate");
		
		this.gl_Uniform_WorldMatrix = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uWorldMatrix");
		this.gl_Uniform_ViewMatrix = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uViewMatrix");
		this.gl_Uniform_ProjectionMatrix = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uProjectionMatrix");
		
		this.gl_Uniform_Texture = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uTexture");
		this.gl_Uniform_ModulateCordinate = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uModulateCordinate");
		this.gl_Uniform_Color = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uColor");
		
		gl.useProgram(null);
	},
	
	initialize : function(){
		this.initCanvas();
		
		if(!this.isAvailWebGL()){
			//alert("WebGL is not available");
			return false;
		}
		
		this.initResource();
		this.initShader();
		
		this.clear();
	},

	drawBlock : function(nPosX, nPosY, nBlockSize, nTexturePos, vColor){
		var gl = this.ctx;

		gl.useProgram(this.gl_Shader_RenderProgram);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexPosition);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexColor);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexCordinate);
		   
		var arCameraGap = [0.0,0.0,0.0];
		arCameraGap[1] = this.fCameraDistance * Math.sin(this.fAngleYZ);	//Y
		arCameraGap[0] = this.fCameraDistance * Math.cos(this.fAngleYZ) * Math.cos(this.fAngleXZ);	//X
		arCameraGap[2] = this.fCameraDistance * Math.cos(this.fAngleYZ) * Math.sin(this.fAngleXZ);	//Z
		this.arCameraEye[0] = this.arCameraLookAt[0] + arCameraGap[0];
		this.arCameraEye[1] = this.arCameraLookAt[1] + arCameraGap[1];
		this.arCameraEye[2] = this.arCameraLookAt[2] + arCameraGap[2];
				
		var WorldMatrix = mat4.create();
		var ViewMatrix = mat4.create();
		var ProjectionMatrix = mat4.create();
		mat4.identity(WorldMatrix);
		mat4.scale(WorldMatrix, [nBlockSize,nBlockSize,nBlockSize], WorldMatrix);
		mat4.translate(WorldMatrix, [nPosX,nPosY,0.0], WorldMatrix);
		mat4.lookAt(this.arCameraEye, this.arCameraLookAt, [0.0,1.0,0.0], ViewMatrix);
		if(this.bCameraPerspective == true)		
			mat4.perspective(this.nFov, this.nWidth/this.nHeight, 0.1, 1000.0, ProjectionMatrix);
		else if(this.bCameraPerspective == false)
			mat4.ortho(-this.nWidth/2, this.nWidth/2, -this.nHeight/2, this.nHeight/2, 0.1, 1000.0, ProjectionMatrix);
		gl.uniformMatrix4fv(this.gl_Uniform_WorldMatrix, false, WorldMatrix);
		gl.uniformMatrix4fv(this.gl_Uniform_ViewMatrix, false, ViewMatrix);
		gl.uniformMatrix4fv(this.gl_Uniform_ProjectionMatrix, false, ProjectionMatrix);
		
		if(this.gl_Tex_Cube.bIsLoaded == true){
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.gl_Tex_Cube);
			gl.uniform1i(this.gl_Uniform_Texture, 0);
		}
		gl.uniform4fv(this.gl_Uniform_ModulateCordinate, [0.0625,1.0,0.0625*nTexturePos,0.0]);
		gl.uniform4fv(this.gl_Uniform_Color, vColor);
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		if(vColor[3] < 1.0){
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.blendEquation(gl.FUNC_ADD);
		}
		else{
			gl.disable(gl.BLEND);			
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Position_Cube);
		gl.vertexAttribPointer(this.gl_Attribute_VertexPosition, this.gl_VB_Position_Cube.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Color_Cube);
		gl.vertexAttribPointer(this.gl_Attribute_VertexColor, this.gl_VB_Color_Cube.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Cordinate_Cube);
		gl.vertexAttribPointer(this.gl_Attribute_VertexCordinate, this.gl_VB_Cordinate_Cube.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_IB_Cube);
		gl.drawElements(gl.TRIANGLES, this.gl_IB_Cube.numItems, gl.UNSIGNED_SHORT, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.disableVertexAttribArray(this.gl_Attribute_VertexPosition);
		gl.disableVertexAttribArray(this.gl_Attribute_VertexColor);
		gl.disableVertexAttribArray(this.gl_Attribute_VertexCordinate);
		gl.useProgram(null);

		//console.log("drawImage");
	},
	
	clear : function(){
		var gl = this.ctx;
		
		gl.clearColor(0.0,0.0,0.0,0.0);
		gl.viewport(0, 0, this.nWidth, this.nHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
});