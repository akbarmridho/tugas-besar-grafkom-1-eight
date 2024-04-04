precision mediump float;
attribute vec2 a_position;
attribute vec4 vertColor;
varying vec4 fragColor;

uniform vec2 u_resolution;

void main() {
    fragColor = vertColor;
    gl_PointSize = 7.5;

    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}