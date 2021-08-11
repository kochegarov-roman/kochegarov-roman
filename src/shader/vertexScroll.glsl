uniform float time;
varying vec3 vPosition;
uniform vec2 pixels;
varying vec2 vUv;
float PI = 3.141592653589793238;
uniform float distanceFromCenter;
uniform float distance;

void main() {
    vUv = (uv - vec2(0.5))*(0.9) + vec2(0.5);
    vec3 pos = position;
    pos.y += sin(PI*uv.x)*0.01;
    pos.z += sin(PI*uv.x)*0.02;

    pos.y += sin(time*0.3)*0.02;
    vUv.y -= sin(time*0.3)*0.02;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}




