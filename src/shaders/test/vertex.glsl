uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv;

uniform float uSpeed;
uniform float uTime;
uniform float uScale;
uniform float uFrequency;

varying float vSpeed;
varying float vTime;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.z += sin(modelPosition.x * uFrequency + uTime * uSpeed) * uScale;
    modelPosition.z += sin(modelPosition.y * uFrequency + uTime * uSpeed) * uScale;

    modelPosition.x += sin(modelPosition.y * uFrequency + uTime * uSpeed) * uScale;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vSpeed = uSpeed;
    vTime = uTime;
    vPosition = modelPosition.xyz;
    vUv = uv;
}

