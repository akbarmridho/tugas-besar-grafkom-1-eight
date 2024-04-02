precision mediump float;
attribute vec4 a_position;
attribute vec4 vertColor;
varying vec4 fragColor;

void main() {
    fragColor = vertColor;
    gl_PointSize = 10.0;
    gl_Position = a_position;
}