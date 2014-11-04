precision mediump float;

uniform sampler2D uTexture;
uniform vec4 uModulateCordinate;
uniform vec4 uColor;

varying vec4 vColor;
varying vec2 vCordinate;

void main(void) {
	//gl_FragColor = vColor*uColor;
	//gl_FragColor = vec4(vCordinate, 0.0, 1.0);
	//gl_FragColor = texture2D(uTexture, vec2(vCordinate.x*uModulateCordinate.x+uModulateCordinate.z, vCordinate.y*uModulateCordinate.y+uModulateCordinate.w));
	
	vec2 TextureCordinate = vCordinate.xy*uModulateCordinate.xy + uModulateCordinate.zw;
	vec4 TextureColor = texture2D(uTexture, TextureCordinate);
	vec4 VertexColor = vColor*uColor;
	gl_FragColor = TextureColor*VertexColor;
}