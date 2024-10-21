precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vSpeed;
varying float vTime;
varying vec3 vPosition;
varying vec2 vUv;

void main()
{
    vec3 color = texture2D(uTexture, vUv).rgb;

    gl_FragColor = vec4(color, 0.6 + sin(vPosition.y + 1.0 + vTime * vSpeed) * 0.4);
}

