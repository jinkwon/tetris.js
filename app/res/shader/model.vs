attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aVertexCordinate;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vColor;
varying vec2 vCordinate;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    vCordinate = aVertexCordinate;
}